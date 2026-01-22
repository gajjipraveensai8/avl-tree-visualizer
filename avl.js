// avl.js
// Pure AVL tree implementation (no DOM / visualization code)

class AVLNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1; // leaf node height
  }
}

class AVLTree {
  constructor() {
    this.root = null;
  }

  // Public insert method
  insert(value) {
    if (value == null || Number.isNaN(Number(value))) return;
    this.root = this._insert(this.root, Number(value));
  }

  // Internal recursive insertion returns new subtree root
  _insert(node, value) {
    if (!node) return new AVLNode(value);

    if (value === node.value) {
      // duplicate: choose to ignore duplicates for simplicity
      return node;
    }

    if (value < node.value) {
      node.left = this._insert(node.left, value);
    } else {
      node.right = this._insert(node.right, value);
    }

    // update height and rebalance
    node.height = 1 + Math.max(this._height(node.left), this._height(node.right));
    const balance = this._getBalance(node);

    // Left Left Case
    if (balance > 1 && value < node.left.value) {
      return this._rotateRight(node);
    }

    // Right Right Case
    if (balance < -1 && value > node.right.value) {
      return this._rotateLeft(node);
    }

    // Left Right Case
    if (balance > 1 && value > node.left.value) {
      node.left = this._rotateLeft(node.left);
      return this._rotateRight(node);
    }

    // Right Left Case
    if (balance < -1 && value < node.right.value) {
      node.right = this._rotateRight(node.right);
      return this._rotateLeft(node);
    }

    return node;
  }

  // Utility: get height of a node (0 for null)
  _height(node) {
    return node ? node.height : 0;
  }

  // Public helper: height of tree
  height() {
    return this._height(this.root);
  }

  // Balance factor = height(left) - height(right)
  _getBalance(node) {
    if (!node) return 0;
    return this._height(node.left) - this._height(node.right);
  }

  // Right rotation
  _rotateRight(y) {
    const x = y.left;
    const T2 = x.right;

    // Perform rotation
    x.right = y;
    y.left = T2;

    // Update heights
    y.height = 1 + Math.max(this._height(y.left), this._height(y.right));
    x.height = 1 + Math.max(this._height(x.left), this._height(x.right));

    // Return new root
    return x;
  }

  // Left rotation
  _rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;

    // Perform rotation
    y.left = x;
    x.right = T2;

    // Update heights
    x.height = 1 + Math.max(this._height(x.left), this._height(x.right));
    y.height = 1 + Math.max(this._height(y.left), this._height(y.right));

    // Return new root
    return y;
  }

  // Traverse tree to produce simple plain JS objects for visualization
  // This returns nodes with {value, left, right} structure (references to nodes)
  toObject() {
    return this.root;
  }

  // Clear tree
  clear() {
    this.root = null;
  }
}

// Expose in browser global
if (typeof window !== 'undefined') {
  window.AVLNode = AVLNode;
  window.AVLTree = AVLTree;
}
