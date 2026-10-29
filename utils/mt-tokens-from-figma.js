/**
 * Generates the MT Pagamentos token partials from the Figma variables export.
 *
 * Input:  mt/figma/variables.json (Figma "Variables" JSON export)
 * Output: src/_mt-tokens.scss      fonts, shape, elevation, blur and the 4 color themes
 *         src/_mt-typography.scss  .mt-typography--* classes for the Material type scale
 *
 * Usage: npm run tokens:mt  (then npm run build:mt)
 */
'use strict';

var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var INPUT = path.join(ROOT, 'mt', 'figma', 'variables.json');
var figma = JSON.parse(fs.readFileSync(INPUT, 'utf8'));

var WEIGHTS = {Thin: 100, Light: 300, Regular: 400, Medium: 500, SemiBold: 600, Bold: 700, ExtraBold: 800};
var FALLBACK = '\'Helvetica Neue\', \'Helvetica\', \'Arial\', sans-serif';

function collection(name) {
  var found = figma.collections.filter(function(c) { return c.name === name; })[0];
  if (!found) { throw new Error('Collection "' + name + '" not found in ' + INPUT); }
  return found;
}

function variables(name) {
  return collection(name).modes[0].variables;
}

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Figma exports #RRGGBB or #RRGGBBAA.
function parseHex(hex) {
  var h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
    a: h.length === 8 ? Math.round(parseInt(h.slice(6, 8), 16) / 255 * 100) / 100 : 1
  };
}

function shadow(effects) {
  return effects.filter(function(e) { return e.type === 'DROP_SHADOW'; }).map(function(e) {
    return e.offset.x + 'px ' + e.offset.y + 'px ' + e.radius + 'px ' + (e.spread || 0) + 'px ' +
        'rgba(' + e.color.r + ', ' + e.color.g + ', ' + e.color.b + ', ' + e.color.a + ')';
  }).join(', ');
}

function px(value) {
  return Math.round(value * 100) / 100 + 'px';
}

// ---------- Fonts ----------

var typeface = {};
variables('Typeface').forEach(function(v) { typeface[v.name] = v.value; });

// Font files bundled in src/fonts (copied to dist/mt/fonts by build-mt.js).
var LATIN = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, ' +
    'U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
var LATIN_EXT = 'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, ' +
    'U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';

function fontFaces(family) {
  var file = family.toLowerCase();
  if (!fs.existsSync(path.join(ROOT, 'src', 'fonts', file + '-latin-wght-normal.woff2'))) {
    throw new Error('Missing font files for "' + family + '" in src/fonts');
  }
  return [['latin-ext', LATIN_EXT], ['latin', LATIN]].map(function(subset) {
    return '@font-face {\n' +
        '  font-family: \'' + family + '\';\n' +
        '  font-style: normal;\n' +
        '  font-display: swap;\n' +
        '  font-weight: 100 900;\n' +
        '  src: url("fonts/' + file + '-' + subset[0] + '-wght-normal.woff2") format("woff2");\n' +
        '  unicode-range: ' + subset[1] + ';\n' +
        '}\n';
  }).join('\n');
}

// ---------- Shared tokens ----------

var shared = [];
shared.push('  --mt-font-display: \'' + typeface.display + '\', ' + FALLBACK + ';');
shared.push('  --mt-font-body: \'' + typeface.body + '\', ' + FALLBACK + ';');
shared.push('');

variables('Shape').forEach(function(v) {
  shared.push('  --mt-shape-' + v.name.replace(/^rounded-/, '') + ': ' + v.value + 'px;');
});
shared.push('');

var effects = variables('Effects');
effects.filter(function(v) { return /^Blur\//.test(v.name); }).forEach(function(v, i) {
  shared.push('  --mt-blur-' + (i + 1) + ': ' + v.value.effects[0].radius + 'px;');
});
shared.push('');

function elevations(prefix) {
  return effects.filter(function(v) { return v.name.indexOf(prefix) === 0; }).map(function(v) {
    return '  --mt-elevation-' + v.name.split('/')[1] + ': ' + shadow(v.value.effects) + ';';
  });
}
shared = shared.concat(elevations('Elevation Light/'));
shared.push('');
shared.push('  --mt-state-hover-opacity: 0.08;');
shared.push('  --mt-state-focus-opacity: 0.12;');
shared.push('  --mt-state-pressed-opacity: 0.12;');
shared.push('  --mt-state-disabled-opacity: 0.38;');

// Typography: one font shorthand + tracking per Material style.
var typeStyles = variables('Typography').filter(function(v) {
  return /^Material typography\/(display|headline|title|label|body)\//.test(v.name);
}).map(function(v) {
  var parts = v.name.split('/');
  var t = v.value;
  var family = t.fontFamily === typeface.display ? 'var(--mt-font-display)' :
      t.fontFamily === typeface.body ? 'var(--mt-font-body)' : '\'' + t.fontFamily + '\', ' + FALLBACK;
  var tracking = t.letterSpacingUnit === 'PERCENT' ? (t.letterSpacing / 100) + 'em' : px(t.letterSpacing);
  return {
    name: parts[1] + '-' + parts[2],
    font: WEIGHTS[t.fontWeight] + ' ' + px(t.fontSize) + '/' + px(t.lineHeight) + ' ' + family,
    tracking: tracking === '0em' ? '0' : tracking
  };
});
shared.push('');
typeStyles.forEach(function(s) {
  shared.push('  --mt-type-' + s.name + ': ' + s.font + ';');
  shared.push('  --mt-type-' + s.name + '-tracking: ' + s.tracking + ';');
});

// ---------- Color themes ----------

var GROUP_ORDER = ['primary', 'secondary', 'tertiary', 'error', 'success', 'warning', 'info',
  'surface', 'alternative surface', 'outline', 'scrim'];

var themes = collection('Theme').modes.map(function(mode) {
  var vars = mode.variables.slice().sort(function(a, b) {
    var ga = GROUP_ORDER.indexOf(a.name.split('/')[0].toLowerCase());
    var gb = GROUP_ORDER.indexOf(b.name.split('/')[0].toLowerCase());
    return ga - gb || a.name.localeCompare(b.name);
  });
  var id = slug(mode.name);
  var selector = id === 'varejo-light' ? ':root,\n[data-mt-theme="varejo-light"]' : '[data-mt-theme="' + id + '"]';
  var lines = ['// ' + mode.name, selector + ' {'];
  var group = null;
  vars.forEach(function(v) {
    var g = v.name.split('/')[0];
    if (group !== null && g !== group) { lines.push(''); }
    group = g;
    var name = v.name.split('/').pop();
    var c = parseHex(v.value);
    var value = c.a < 1 ? 'rgba(' + c.r + ', ' + c.g + ', ' + c.b + ', ' + c.a + ')' : v.value.toLowerCase();
    lines.push('  --mt-' + name + ': ' + value + ';');
    lines.push('  --mt-' + name + '-rgb: ' + c.r + ', ' + c.g + ', ' + c.b + ';');
  });
  if (/dark/.test(id)) {
    lines.push('');
    lines.push('  color-scheme: dark;');
    lines = lines.concat(elevations('Elevation Dark/'));
  }
  lines.push('}');
  return lines.join('\n');
});

var HEADER = '// GENERATED by utils/mt-tokens-from-figma.js from mt/figma/variables.json.\n' +
    '// Do not edit by hand: update the Figma export and run `npm run tokens:mt`.\n\n';

var tokens = HEADER +
    '/**\n' +
    ' * MT Pagamentos design tokens (Figma variables export v' + figma.version + ').\n' +
    ' *\n' +
    ' * Every color is exposed twice: as a ready-to-use value (--mt-primary) and as\n' +
    ' * an RGB triplet (--mt-primary-rgb) so MDL can keep composing rgb()/rgba().\n' +
    ' * Themes: varejo-light (default), varejo-dark, ativos-light, ativos-dark.\n' +
    ' * Switch at runtime with <html data-mt-theme="varejo-dark">.\n' +
    ' */\n\n' +
    '/* ==========  Fonts (bundled, SIL Open Font License)  ========== */\n\n' +
    fontFaces(typeface.display) + '\n' + fontFaces(typeface.body) + '\n' +
    '/* ==========  Fonts, shape, effects and type (all themes)  ========== */\n\n' +
    ':root {\n' + shared.join('\n') + '\n}\n\n' +
    '/* ==========  Color themes  ========== */\n\n' +
    themes.join('\n\n') + '\n';

var typography = HEADER +
    '// Material type scale from the Figma "Typography" collection.\n' +
    '// Usage: <h1 class="mt-typography--headline-large">\n\n' +
    typeStyles.map(function(s) {
      return '.mt-typography--' + s.name + ' {\n' +
          '  font: var(--mt-type-' + s.name + ');\n' +
          '  letter-spacing: var(--mt-type-' + s.name + '-tracking);\n' +
          '}\n';
    }).join('\n');

fs.writeFileSync(path.join(ROOT, 'src', '_mt-tokens.scss'), tokens);
fs.writeFileSync(path.join(ROOT, 'src', '_mt-typography.scss'), typography);
console.log('Wrote src/_mt-tokens.scss and src/_mt-typography.scss (' +
    typeStyles.length + ' type styles, ' + themes.length + ' themes)');
