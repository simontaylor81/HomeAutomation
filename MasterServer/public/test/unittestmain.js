require.config({
    baseUrl: '/javascripts',
    paths: {
        views: '/views',
        handlebars: 'lib/handlebars-v1.1.2',
        jsep: 'lib/jsep-0.2.8/jsep',
        QUnit: 'http://code.jquery.com/qunit/qunit-1.14.0'
    },
    shim: {
        'handlebars': {
            exports: 'Handlebars'
        },
        'jsep': {
            exports: 'jsep',
            init: function () { return this.jsep.noConflict(); }
        },
        'QUnit': {
            exports: 'QUnit',
            init: function() {
                QUnit.config.autoload = false;
                QUnit.config.autostart = false;
            }
        }
    }
});

require(['QUnit', 'lib/modelprop'], function (QUnit, modelprop) {

    function makeContext() { return { a: 1, b: 2, s:'a', sub: { c: 3 }, fn: function (x) { return x + 1; } }; }
    function makeRootContext() { return { sub: { a: 'a', b: 'b', array: [10, 11, 12] } }; }

    // Test for valid gets
    test('modelprop valid get tests', function () {
        var context = makeContext();
        var rootContext = makeRootContext();

        strictEqual(modelprop.get(context, rootContext, '17'), 17, 'Number literal');
        strictEqual(modelprop.get(context, rootContext, '"cheese"'), 'cheese', 'String literal');
        strictEqual(modelprop.get(context, rootContext, 'a'), 1, 'Simple context member access (number)');
        strictEqual(modelprop.get(context, rootContext, 's'), 'a', 'Simple context member access (string)');
        strictEqual(modelprop.get(context, rootContext, '$root'), rootContext, 'root context access');
        strictEqual(modelprop.get(context, rootContext, 'this'), context, 'this equals context');
        strictEqual(modelprop.get(context, rootContext, 'sub.c'), 3, 'sub-property access');
        strictEqual(modelprop.get(context, rootContext, '$root.sub.a'), 'a', 'root context sub-property access');
        strictEqual(modelprop.get(context, rootContext, 'this[$root.sub.a]'), 1, 'property key from variable');
        strictEqual(modelprop.get(context, rootContext, '$root["sub"].array[a]'), 11, 'string literal property key, variable array access');
        strictEqual(modelprop.get(context, rootContext, '$root["sub"].array[this.b]'), 12, 'explicit this within sub-expression');
        strictEqual(modelprop.get(context, rootContext, 'fn(sub.c)'), 4, 'function call with single argument');
    });

    // Test for invalid gets
    test('modelprop invalid get tests', function () {
        var context = { fn: function(x) { return x; } };
        var rootContext = makeRootContext();

        strictEqual(modelprop.get(context, rootContext, 'invalid'), undefined, 'Context missing key');
        strictEqual(modelprop.get(context, rootContext, '$root.invalid'), undefined, 'Root context missing key');
        strictEqual(modelprop.get(context, rootContext, 'invalid.sub'), undefined, 'missing key with sub prop');
        strictEqual(modelprop.get(context, rootContext, 'invalid[1]'), undefined, 'missing key with array index');
        strictEqual(modelprop.get(context, rootContext, 'invalid()'), undefined, 'missing function call');
        strictEqual(modelprop.get(context, rootContext, 'fn(invalid)'), undefined, 'function call with invalid arg');
    });

    // Test for gets with invalid/unsupported syntax
    test('modelprop bad syntax get tests', function () {
        throws(function () { modelprop.get({}, {}, '1 === 1') }, 'unsupported operator');
        throws(function () { modelprop.get({}, {}, ')&`') }, 'invalid syntax');
    });

    // Test for valid sets
    test('modelprop valid set tests', function () {
        var context = makeContext();
        var rootContext = makeRootContext();

        modelprop.set(context, rootContext, 'a', 4);
        strictEqual(context.a, 4, 'simple context set');

        modelprop.set(context, rootContext, 'sub.c', 5);
        strictEqual(context.sub.c, 5, 'sub-property set');

        modelprop.set(context, rootContext, '$root.sub.a', 'x');
        strictEqual(rootContext.sub.a, 'x', 'root context sub-property set');

        modelprop.set(context, rootContext, '$root.sub.array[fn(1)]', 23);
        strictEqual(rootContext.sub.array[2], 23, 'array index with function call set');
    });

    // Test for invalid sets
    test('modelprop invalid set tests', function () {
        var context = makeContext();
        var rootContext = makeRootContext();

        modelprop.set(context, rootContext, 'invalid.c', 5);
        ok(true, 'invalid property with sub-property set does not crash');

        throws(function () { modelprop.set({}, {}, '12', 5); }, 'cannot set number literal');
        throws(function () { modelprop.set({}, {}, '"string"', 'val'); }, 'cannot set string literal');
        throws(function () { modelprop.set({}, {}, 'this', 5); }, 'cannot set this');
        throws(function () { modelprop.set({}, {}, '$root', 5); }, 'cannot set $root');
        throws(function () { modelprop.set({}, {}, 'fn()', 5); }, 'cannot set function call');
        throws(function () { modelprop.set({}, {}, '1 === 1') }, 'unsupported operator');
        throws(function () { modelprop.set({}, {}, ')&`') }, 'invalid syntax');
    });

    QUnit.load();
    QUnit.start();
});