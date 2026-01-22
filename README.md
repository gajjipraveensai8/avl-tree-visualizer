# AVL Tree Visualizer

This is a small, beginner-friendly project that visualizes an AVL (self-balancing binary search) tree in the browser using plain HTML, CSS and JavaScript — no frameworks.

## What is an AVL Tree?

An AVL tree is a self-balancing binary search tree. For every node, the heights of the left and right subtrees differ by at most 1. When an insertion makes the tree unbalanced, one or more rotations (left/right) are performed to restore balance. The balancing guarantees O(log n) lookup/insert/delete time in the average and worst case.

Key properties:
- Each node stores a value and the height of the subtree rooted at that node.
- Balance factor = height(left) - height(right).
- When balance factor is outside [-1, 1], rotations are applied: LL, RR, LR, RL.

## Project features

- Insert numbers into the AVL tree via a simple input.
- Visual representation using SVG: nodes are circles and edges are lines.
- Auto-positioned nodes based on inorder layout and depth.
- Reset button to clear the tree and SVG.
- Pure separation of concerns: `avl.js` contains only data structure logic (no DOM). `visualizer.js` draws the tree. `script.js` wires UI, tree, and visualizer.

## Tech stack

- Plain HTML, CSS and JavaScript (ES6+)
- No build step required — just open `index.html` in a browser

## Files

- `index.html` — UI and SVG container
- `style.css` — responsive, clean styling
- `avl.js` — AVL tree implementation (AVLNode, AVLTree, insert, rotations)
- `visualizer.js` — draws nodes and edges in SVG
- `script.js` — connects DOM controls to AVL and visualizer

## How to run locally

1. Clone or download this repository.
2. Open `index.html` in your browser (double-click or use your editor to open it).

That's it — there is no server or build step.

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. In your repository settings on GitHub, go to the Pages section.
3. Select the branch (usually `main` or `master`) and the root folder as the publishing source.
4. Save — GitHub will publish your site at `https://<your-username>.github.io/<repo-name>/` (it may take a moment).

Tip: If the site does not show immediately, try clearing the cache or check the Pages deployment logs.

## Notes and next steps

- Currently duplicates are ignored; you may want to show a message when attempting to insert duplicates.
- The visual layout is simple (inorder spacing). A more advanced layout could space nodes by subtree size to prevent overlap for large trees.
- You can extend the UI with delete operation or animations for rotations.

