'use strict';

// ScriptProcessorNodes need to be global. See
// http://sriku.org/blog/2013/01/30/taming-the-scriptprocessornode/
global.scriptNodes = {};

var nextNodeID = 0;

exports.keep = function (node) {
  node.id = node.id || (nextNodeID++);
  global.scriptNodes[node.id] = node;
  return node;
};

