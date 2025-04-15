import u from 'unist-builder';

// from github.com/syntax-tree/unist-util-map/blob/bb0567f651517b2d521af711d7376475b3d8446a/index.js
const map = (tree, iteratee) => {
  const preorder = (node, index, parent) => {
    const newNode = iteratee(node, index, parent);

    if (Array.isArray(newNode.children)) {
      newNode.children = newNode.children.map((child, index) => {
        return preorder(child, index, node);
      });
    }

    return newNode;
  };

  return preorder(tree, null, null);
};

export default function VideoIFrame() {
  return (tree) => {
    return map(tree, (node) => {
      if (node.type !== 'text') {
        return node;
      }
      let value = node.value;
      // match [video]id[/video]
      // and get the id
      let match = value.match(/\[youtube\](.*)\[\/youtube\]/);
      if (!match) {
        return node;
      }
      let videoId = match[1];
      node.type = 'text';
      node.value = `src=\"https://www.youtube.com/embed/${videoId}\"`;
      
      // add position
      node.position = {
        start: {
          line: 1,
          column: 1,
          offset: 0
        },
        end: {
          line: 1,
          column: 1,
          offset: 0
        }
      };

      return node;
      
    });
  };
}