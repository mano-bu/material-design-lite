/**
 * Lightweight build for the MT Pagamentos theme.
 *
 * The original gulp 3 / node-sass toolchain no longer installs on current
 * Node versions, so this script compiles the SCSS with Dart Sass (via npx)
 * and concatenates the component scripts in the same order as gulpfile.babel.js.
 *
 * Usage: npm run build:mt  ->  dist/mt/material.css, dist/mt/material.js,
 *                             dist/mt/fonts/ (Outfit + Inter, loaded by the CSS)
 */
'use strict';

var childProcess = require('child_process');
var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var OUT = path.join(ROOT, 'dist', 'mt');
var SASS = 'sass@1.79.4';

// Keep in sync with SOURCES in gulpfile.babel.js.
var SOURCES = [
  'src/mdlComponentHandler.js',
  'src/third_party/rAF.js',
  'src/button/button.js',
  'src/checkbox/checkbox.js',
  'src/icon-toggle/icon-toggle.js',
  'src/menu/menu.js',
  'src/progress/progress.js',
  'src/radio/radio.js',
  'src/slider/slider.js',
  'src/snackbar/snackbar.js',
  'src/spinner/spinner.js',
  'src/switch/switch.js',
  'src/tabs/tabs.js',
  'src/textfield/textfield.js',
  'src/tooltip/tooltip.js',
  'src/layout/layout.js',
  'src/data-table/data-table.js',
  'src/ripple/ripple.js'
];

fs.mkdirSync(OUT, {recursive: true});

childProcess.execFileSync('npx', [
  '--yes', SASS, '--no-source-map', '--quiet',
  path.join(ROOT, 'src', 'material-design-lite.scss'),
  path.join(OUT, 'material.css')
], {stdio: 'inherit'});

// Inline "/images/*.svg?embed" references as data URIs, like gulp-css-inline-images.
var cssFile = path.join(OUT, 'material.css');
var css = fs.readFileSync(cssFile, 'utf8').replace(
  /url\(["']?\/images\/([\w.-]+)\?embed["']?\)/g,
  function(match, name) {
    var svg = fs.readFileSync(path.join(ROOT, 'src', 'images', name));
    return 'url("data:image/svg+xml;base64,' + svg.toString('base64') + '")';
  });
fs.writeFileSync(cssFile, css);

// The CSS loads the bundled fonts from "fonts/" next to material.css.
var fontsOut = path.join(OUT, 'fonts');
fs.mkdirSync(fontsOut, {recursive: true});
fs.readdirSync(path.join(ROOT, 'src', 'fonts')).forEach(function(file) {
  fs.copyFileSync(path.join(ROOT, 'src', 'fonts', file), path.join(fontsOut, file));
});

var js = SOURCES.map(function(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}).join('\n');
fs.writeFileSync(path.join(OUT, 'material.js'), ';(function() {\n' + js + '\n}());\n');

console.log('Built dist/mt/material.css, dist/mt/material.js and dist/mt/fonts/');
