var fs = require('fs');
var Canvas = require('canvas');
var Font = Canvas.Font;
var opentype = require('opentype.js');
var css = require('css');
var Q = require('q');

// Add some polyfills & helpers.
Array.prototype.findIndex = Array.prototype.findIndex || function (callback, thisArg) {
    var i;
    for (i = 0; i < this.length; i++) {
        if (callback.call(thisArg, this[i], i, this)) {
            return i;
        }
    }
    return -1;
};
Array.prototype.find = Array.prototype.find || function (callback, thisArg) {
    // Don't call directly so this can be called on array-like objects.
    var index = Array.prototype.findIndex.call(this, callback, thisArg);
    return index >= 0 ? this[index] : undefined;
};


var fontPromise = loadFont();
var icons = loadIcons();

exports.get = function (req, res) {
    if (!req.query.icon) {
        res.send(400, "Missing icon parameter");
        return;
    }
    var icon = icons[req.query.icon];
    if (!icon) {
        res.send(400, "Invalid icon");
        return;
    }

    var width = parseInt(req.query.w) || 128;
    var height = parseInt(req.query.h) || 128;

    fontPromise.then(function (font) {
        var canvas = new Canvas(width, height);
        var ctx = canvas.getContext('2d');

        // Get a default-scaled path for the glyph.
        var glyph = font.charToGlyph(icon);
        var path = glyph.getPath();

        // Find the bounding box of the glyph.
        var bounds = calcPathBounds(path);

        // Set the transform to centre the glyph in the canvas.
        setCentringTransform(ctx, bounds);

        //path.fill = 'rgba(0,0,0,0.1)';
        path.draw(ctx);

        res.type('png');
        canvas.pngStream().pipe(res);
    });
};

// Kick off load the Font Awesome font file, returning a promise.
function loadFont() {
    return Q.nfcall(opentype.load, './public/font-awesome/fonts/FontAwesome.otf');
}

// Load available icons from Font Awesome CSS.
function loadIcons() {
    // Load and parse Font Awesome CSS file.
    var cssAst = css.parse(fs.readFileSync('./public/font-awesome/css/font-awesome.css', 'utf8'));
    var allRules = cssAst.stylesheet.rules;

    function unescapeChar(str) {
        if (str[0] === '"' && str[1] === '\\' && str[str.length-1] === '"') {
            var code = parseInt(str.substr(2, str.length - 3), 16);
            return String.fromCharCode(code);
        }
        return str;
    }

    var icons = {};

    // Regex for finding rules that define icons.
    var re = /^.fa-([a-z\-]+):before$/;

    allRules.forEach(function (rule) {
        if (rule.type === 'rule') {
            rule.selectors.forEach(function (selector) {
                var match = re.exec(selector);
                if (match) {
                    // Get the value of the 'content' declaration.
                    icons[match[1]] = unescapeChar(
                        rule.declarations.find(function (decl) { return decl.property === 'content'; }).value);
                }
            });
        }
    });

    return icons;
}

// Get the (approx) bounding box of the given path.
function calcPathBounds(path) {
    var bFirst = true;
    var xMin = 0, xMax = 0, yMin = 0, yMax = 0;

    // Find min and max of each command coordinate.
    // Doesn't take into account control point coords, so this isn't strictly accurate,
    // but it's good enough for our purposes.
    path.commands.forEach(function (command) {
        if (command.x !== undefined) {
            if (bFirst) {
                xMin = xMax = command.x;
                yMin = yMax = command.y;
                bFirst = false;
            }
            else {
                xMin = Math.min(xMin, command.x);
                xMax = Math.max(xMax, command.x);
                yMax = Math.max(yMax, command.y);
                yMin = Math.min(yMin, command.y);
            }
        }
    });

    return { xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax };
}

// Calculate and set a transform that centres the given bounding box in the canvas.
function setCentringTransform(ctx, bounds) {
    var xSize = bounds.xMax - bounds.xMin;
    var ySize = bounds.yMax - bounds.yMin;
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;

    var xScale = w / xSize;
    var yScale = h / ySize;

    // Choose the smaller scale so we fit in both dimesions.
    var scale = Math.min(xScale, yScale);

    // Don't want to fill the entire canvas though, so apply a fixed downscale.
    scale *= 0.75;

    // Translate so the glyph is in the centre.
    var xTranslation = ((w - xSize * scale) / 2 - bounds.xMin * scale);
    var yTranslation = ((h - ySize * scale) / 2 - bounds.yMin * scale);

    ctx.setTransform(scale, 0, 0, scale, xTranslation, yTranslation);
}
