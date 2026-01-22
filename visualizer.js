// visualizer.js
// Draw a binary tree (AVL) to an SVG element.

class Visualizer {
  constructor(svgElement) {
    this.svg = svgElement;
    this.nodeRadius = 26;
    this.levelGap = 110; // vertical space between levels
    this.sidePadding = 40;
    this.prevPositions = new Map(); // value -> {x,y,parent}
    this.nodeElements = new Map(); // value -> g element
    this.edgeElements = new Map(); // 'parentValue-childValue' -> path
    this.animationDuration = 700;

    this._ensureDefs();
  }

  _ensureDefs() {
    // create gradients and filters if not present
    if (this.svg.querySelector('#defs-up')) return;
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    // normal gradient
    const gradNormal = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    gradNormal.setAttribute('id', 'grad-normal');
    gradNormal.setAttribute('cx', '35%');
    gradNormal.setAttribute('cy', '30%');
    gradNormal.innerHTML = `
      <stop offset="0%" stop-color="#60a5fa" />
      <stop offset="100%" stop-color="#2563eb" />
    `;

    const gradInsert = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    gradInsert.setAttribute('id', 'grad-insert');
    gradInsert.setAttribute('cx', '35%');
    gradInsert.setAttribute('cy', '30%');
    gradInsert.innerHTML = `
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#059669" />
    `;

    const gradRot = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    gradRot.setAttribute('id', 'grad-rot');
    gradRot.setAttribute('cx', '30%');
    gradRot.setAttribute('cy', '30%');
    gradRot.innerHTML = `
      <stop offset="0%" stop-color="#fb7185" />
      <stop offset="100%" stop-color="#ef4444" />
    `;

    defs.appendChild(gradNormal);
    defs.appendChild(gradInsert);
    defs.appendChild(gradRot);

    this.svg.appendChild(defs);
  }

  clear() {
    while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);
    this.prevPositions.clear();
    this.nodeElements.clear();
    this.edgeElements.clear();
    this._ensureDefs();
  }

  // Render takes the root node and an optional options object { inserted: value }
  render(root, options = {}) {
    const inserted = options.inserted;
    // snapshot of previous relationships
    const prevParent = new Map();
    for (const [v, info] of this.prevPositions.entries()) prevParent.set(v, info.parent);

    // compute nodes with inorder index
    const nodes = [];
    let index = 0;
    const assignX = (node, depth, parent = null) => {
      if (!node) return;
      assignX(node.left, depth + 1, node);
      node._xIndex = index++;
      node._depth = depth;
      node._parentValue = parent ? parent.value : null;
      nodes.push(node);
      assignX(node.right, depth + 1, node);
    };
    assignX(root, 0);

    const width = Math.max(800, this.svg.clientWidth || parseInt(this.svg.getAttribute('width')) || 800);
    const totalCols = Math.max(1, index);
    const hSpacing = (width - this.sidePadding * 2) / totalCols;

    nodes.forEach(n => {
      n._x = this.sidePadding + (n._xIndex + 0.5) * hSpacing;
      n._y = this.sidePadding + (n._depth * this.levelGap) + this.nodeRadius + 8;
    });

    // create/update nodes
    const newPositions = new Map();
    nodes.forEach(node => {
      const key = String(node.value);
      newPositions.set(key, { x: node._x, y: node._y, parent: node._parentValue });

      let g = this.nodeElements.get(key);
      const isNew = !g;
      if (!g) {
        g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.classList.add('node-group');
        g.classList.add('node-normal');
        g.setAttribute('data-value', key);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', this.nodeRadius);
        circle.classList.add('node');

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.classList.add('nodelabel');
        text.textContent = node.value;
        text.setAttribute('dy', '0.35em');

        g.appendChild(circle);
        g.appendChild(text);
        // start invisible for fade-in
        g.style.opacity = '0';
        this.svg.appendChild(g);
        this.nodeElements.set(key, g);
      }

      // state classes
      g.classList.remove('node-inserted', 'node-rotating');
      if (inserted != null && Number(inserted) === Number(node.value)) {
        g.classList.add('node-inserted');
      }

      // compute transform: if we have previous position, start there to animate
      const prev = this.prevPositions.get(key);
      if (prev) {
        // set current transform to previous coordinates before forcing reflow
        g.style.transform = `translate(${prev.x}px, ${prev.y}px)`;
      } else {
        // new nodes start slightly scaled and lower opacity
        g.style.transform = `translate(${node._x}px, ${node._y + 8}px) scale(0.95)`;
      }

      // ensure rendering ordering: remove and append to place on top
      this.svg.appendChild(g);
    });

    // create/update edges
    // first remove edges no longer present
    const neededEdges = new Set();
    nodes.forEach(p => {
      if (p.left) neededEdges.add(`${p.value}-${p.left.value}`);
      if (p.right) neededEdges.add(`${p.value}-${p.right.value}`);
    });

    for (const key of Array.from(this.edgeElements.keys())) {
      if (!neededEdges.has(key)) {
        const el = this.edgeElements.get(key);
        if (el && el.parentNode) el.parentNode.removeChild(el);
        this.edgeElements.delete(key);
      }
    }

    nodes.forEach(parent => {
      ['left', 'right'].forEach(side => {
        const child = parent[side];
        if (!child) return;
        const edgeKey = `${parent.value}-${child.value}`;
        let path = this.edgeElements.get(edgeKey);
        if (!path) {
          path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.classList.add('edge');
          path.setAttribute('data-edge', edgeKey);
          // place edges behind nodes
          this.svg.insertBefore(path, this.svg.firstChild);
          this.edgeElements.set(edgeKey, path);
        }
        // initial simple path (will be updated in animation loop)
        const d = this._curveD(parent._x, parent._y + this.nodeRadius, child._x, child._y - this.nodeRadius);
        path.setAttribute('d', d);
      });
    });

    // Force layout and then animate nodes to final positions
    // by switching transform to final, letting CSS transition animate them
    // we also run an RAF loop to update path coordinates while nodes are animating

    // small timeout to ensure initial transforms applied
    requestAnimationFrame(() => {
      // trigger fade-in and move to new positions
      nodes.forEach(node => {
        const key = String(node.value);
        const g = this.nodeElements.get(key);
        if (!g) return;
        // final transform
        g.style.opacity = '1';
        g.style.transform = `translate(${node._x}px, ${node._y}px)`;
      });

      // schedule edge updater for duration of animation
      const start = performance.now();
      const duration = this.animationDuration + 50;
      const update = (t) => {
        this._updateEdgesFromDOM();
        if (t - start < duration) requestAnimationFrame(update);
        else {
          // after animation, detect parent changes to mark rotation highlight
          const changed = [];
          for (const [k, info] of newPositions.entries()) {
            const prevP = prevParent.get(k);
            if (prevP !== info.parent && prevP != null) changed.push(k);
          }
          // highlight nodes involved
          changed.slice(0, 6).forEach(k => {
            const g = this.nodeElements.get(k);
            if (g) {
              g.classList.add('node-rotating', 'glow');
              setTimeout(() => g.classList.remove('glow'), 700);
            }
          });
          // cleanup inserted tag after a while
          if (inserted != null) {
            setTimeout(() => {
              const g = this.nodeElements.get(String(inserted));
              if (g) g.classList.remove('node-inserted');
            }, 900);
          }
        }
      };
      requestAnimationFrame(update);
    });

    // store new positions
    this.prevPositions = newPositions;
  }

  // update edge paths based on current node group transforms / positions
  _updateEdgesFromDOM() {
    for (const [edgeKey, path] of this.edgeElements.entries()) {
      const [pVal, cVal] = edgeKey.split('-');
      const pg = this.nodeElements.get(String(pVal));
      const cg = this.nodeElements.get(String(cVal));
      if (!pg || !cg) continue;
      const pRect = pg.getBoundingClientRect();
      const cRect = cg.getBoundingClientRect();
      // We need coordinates relative to SVG viewport
      const svgRect = this.svg.getBoundingClientRect();
      const px = pRect.left + pRect.width / 2 - svgRect.left;
      const py = pRect.top + pRect.height / 2 - svgRect.top;
      const cx = cRect.left + cRect.width / 2 - svgRect.left;
      const cy = cRect.top + cRect.height / 2 - svgRect.top;

      const startY = py + this.nodeRadius * 0.2;
      const endY = cy - this.nodeRadius * 0.6;
      const d = this._curveD(px, startY, cx, endY);
      path.setAttribute('d', d);
    }
  }

  // create a smooth cubic bezier curve between two points
  _curveD(x1, y1, x2, y2) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const curvature = Math.min(0.6, 0.3 + dy / 300); // adapt curvature
    const cx1 = x1;
    const cy1 = y1 + (y2 - y1) * curvature;
    const cx2 = x2;
    const cy2 = y2 - (y2 - y1) * curvature;
    return `M ${x1} ${y1} C ${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}`;
  }
}

// Expose Visualizer globally
if (typeof window !== 'undefined') window.Visualizer = Visualizer;
