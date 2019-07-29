#!/usr/bin/env node

'use strict';

var colors = require('colors'),
    fs = require('fs'),
    minimist = require('minimist'),
    path = require('path');

var argv = minimist(process.argv.slice(2), { '--': true });

if (argv.h) {
  help();
}

if (argv.v) {
  version();
}

var filename = argv._[0], compiler, error;
check();

if (argv.p) {
  process.chdir(path.dirname(filename));
  filename = path.basename(filename);
}

if (argv.i) {
  handler(true);
}

console.log('start watching:', filename.green)
var timeout;
fs.watch(filename, function (eventType) {
  if (eventType !== 'change')
    return;
  clearTimeout(timeout);
  timeout = setTimeout(handler, 100);
});

function check() {
  if (!filename) {
    error = 'file is missing';
  } else if (!fs.existsSync(filename)) {
    error = 'invalid file';
  } else if (!fs.statSync(filename).isFile()) {
    error = 'path must be file';
  } else {
    var module, opts;
    switch (path.extname(filename)) {
      case '.styl':
        module = "stylus";
        opts = options('-p');
        break;
      default:
        error = 'unsupported file type';
    }
    if (module) {
      compiler = require('./' + module)(opts || options());
      return;
    }
  }
  if (error) {
    console.log(error + (filename ? ':' : ''), filename ? filename : '');
    process.exit(1);
  }
}

function options() {
  var options = argv['--'], args = [].slice.call(arguments, 0), opts = args.pop();
  if (typeof opts != "object") {
    args.push(opts);
    opts = {};
  }
  for (var i = 0; i < args.length; i++) {
    options.push(args[i]);
  }
  return minimist(options, opts);
}

function handler(silent) {
  if (!silent) {
    console.log('file is changed!'.cyan);
  }
  var str = fs.readFileSync(filename, 'utf8');
  compiler(str, filename);
}

function help() {
  console.log([
      'Usage:'
    , '  watch-compiler file [options]'
    , '  watch-compiler file [options] -- [arguments]'
    , ''
    , 'Options:'
    , '  -p   Change dir to path of file'
    , '  -i   Compile once immediately'
    , '  -v   Display version'
    , '  -h   Display help information'
    , ''
    , 'Arguments: Compiler options'
  ].join('\n'));
  process.exit();
}

function version() {
  var json = JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf8'));
  console.log(json.version);
  process.exit();
}
