#!/usr/bin/env node
'use strict';
// check if stdin is interactive, coerce to bool, then if it's being piped to
// isTTY will be false
var useStdin = !!!(process.stdin.isTTY);
var fs = require('fs');
var path = require('path');
var dir = path.resolve(process.cwd(), process.argv[2] || 'tree-output');

if (!useStdin) {
  console.log('Usage: cat <tree.out> | eert <output directory>');
  process.exit(1);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

var data = '';

process.stdin.on('data', function(chunk) {
  data += chunk;
});

process.stdin.on('end', function () {
  var files = data.split('\n').slice(1).filter(isNode).map(findName);

  try {
    fs.mkdirSync(dir);
  } catch (e) {}

  process.chdir(dir);

  var last = files.reduce(function (previous, value, i, files) {

    if (!previous) {
      return value;
    }

    if (previous.depth < value.depth) {
      dir = path.resolve(dir, previous.name);
      fs.mkdirSync(dir);
      process.chdir(dir);
    } else {
      fs.writeFileSync(path.resolve(dir, previous.name));

      if (value.depth < previous.depth) {
        var length = previous.depth - value.depth;
        for (var i = 0; i < length; i++) {
          dir = path.resolve(dir, '..');
          process.chdir(dir);
        }
      }
    }

    return value;
  });

  fs.writeFileSync(path.resolve(dir, last.name));
});

var nodes = [
  '├── ',
  '│   ',
  '└── ',
  '    '
];

function isNode(str) {
  return nodes.indexOf(str.substr(0, 4)) !== -1;
}

function findName(str) {
  str = str.replace(/\s+$/g, '');
  var length = str.length;

  // following two tests should never actually match
  if (str.length === 0) {
    return null;
  }

  if (str === '.') {
    return null;
  }

  var depth = -1;
  while (isNode(str) && str.length > 4) {
    str = str.slice(4);
    depth++;
  }

  return { name: str, depth: depth };
}