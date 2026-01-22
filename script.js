// script.js
// Wire up UI controls to AVL tree and visualizer

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('valueInput');
  const insertBtn = document.getElementById('insertBtn');
  const resetBtn = document.getElementById('resetBtn');
  const svg = document.getElementById('treeSvg');

  // create tree and visualizer
  const tree = new AVLTree();
  const viz = new Visualizer(svg);

  function render() {
    // set SVG width to container width so spacing works responsively
    const rect = svg.getBoundingClientRect();
    svg.setAttribute('width', Math.max(600, Math.floor(rect.width)));
    viz.render(tree.toObject());
  }

  insertBtn.addEventListener('click', () => {
    const val = input.value.trim();
    if (val === '') return;
    const n = Number(val);
    if (Number.isNaN(n)) return;
    tree.insert(n);
    input.value = '';
    // pass inserted value so visualizer can highlight it
    const rect = svg.getBoundingClientRect();
    svg.setAttribute('width', Math.max(600, Math.floor(rect.width)));
    viz.render(tree.toObject(), { inserted: n });
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') insertBtn.click();
  });

  resetBtn.addEventListener('click', () => {
    tree.clear();
    viz.clear();
  });

  // initial render
  render();
  // re-render on window resize for responsiveness
  window.addEventListener('resize', () => requestAnimationFrame(render));
});
