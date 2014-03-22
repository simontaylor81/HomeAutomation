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

    function makeContext() {
        return {
            a: 1,
            b: 2,
            s:'a',
            sub: {
                c: 3,
                thisFn: function () { return this; }
            },
            fn: function (x) { return x + 1; }
        };
    }
    function makeRootContext() { return { sub: { a: 'a', b: 'b', array: [10, 11, 12] } }; }

    // Test for valid gets
    test('modelprop valid get tests', function () {
        var context = makeContext();
        var rootContext = makeRootContext();

        strictEqual(modelprop.get(context, rootContext, '17'), 17, 'Number literal');
        strictEqual(modelprop.get(context, rootContext, '"cheese"'), 'cheese', 'String literal');
        strictEqual(modelprop.get(context, rootContext, 'a'), context.a, 'Simple context member access (number)');
        strictEqual(modelprop.get(context, rootContext, 's'), context.s, 'Simple context member access (string)');
        strictEqual(modelprop.get(context, rootContext, '$root'), rootContext, 'root context access');
        strictEqual(modelprop.get(context, rootContext, 'this'), context, 'this equals context');
        strictEqual(modelprop.get(context, rootContext, 'sub.c'), context.sub.c, 'sub-property access');
        strictEqual(modelprop.get(context, rootContext, '$root.sub.a'), rootContext.sub.a, 'root context sub-property access');
        strictEqual(modelprop.get(context, rootContext, 'this[$root.sub.a]'), context[rootContext.sub.a], 'property key from variable');
        strictEqual(modelprop.get(context, rootContext, '$root["sub"].array[a]'), rootContext["sub"].array[context.a], 'string literal property key, variable array access');
        strictEqual(modelprop.get(context, rootContext, '$root["sub"].array[this.b]'), rootContext["sub"].array[context.b], 'explicit this within sub-expression');
        strictEqual(modelprop.get(context, rootContext, 'fn(sub.c)'), context.fn(context.sub.c), 'function call with single argument');
        strictEqual(modelprop.get(context, rootContext, 'sub.thisFn()'), context.sub.thisFn(), 'function call with this access');
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

    // Test for getWithParent
    test('modelprop valid getWithParent tests', function () {
        var context = {
            a: 1,
            sub: {
                b: 2,
                sub_sub: { c: 3 }
            },
            fn: function () { return 0; }
        };
        var rootContext = {};
        var result;

        result = modelprop.getWithParent(context, {}, 'a');
        strictEqual(result.value, context.a, "'a' returns context.a");
        strictEqual(result.parent, context, "parent of 'a' is context");

        result = modelprop.getWithParent(context, {}, 'sub.b');
        strictEqual(result.value, context.sub.b, "'sub.b' returns context.sub.b");
        strictEqual(result.parent, context.sub, "parent of 'sub.b' is context.sub");

        result = modelprop.getWithParent(context, {}, 'sub.sub_sub.c');
        strictEqual(result.value, context.sub.sub_sub.c, "'sub.sub_sub.c' returns context.sub.sub_sub.c");
        strictEqual(result.parent, context.sub.sub_sub, "parent of 'sub.sub_sub.c' is context.sub.sub_sub");

        result = modelprop.getWithParent(context, {}, '1');
        strictEqual(result.value, 1, "'1' returns 1");
        strictEqual(result.parent, undefined, "parent of literal is undefined");

        result = modelprop.getWithParent(context, {}, 'this');
        strictEqual(result.value, context, "'this' returns context");
        strictEqual(result.parent, undefined, "parent of this is undefined");

        result = modelprop.getWithParent(context, rootContext, '$root');
        strictEqual(result.value, rootContext, "'$root' returns rootContext");
        strictEqual(result.parent, undefined, "parent of $root is undefined");

        result = modelprop.getWithParent(context, rootContext, 'fn()');
        strictEqual(result.value, context.fn(), "'fn()' returns context.fn()");
        strictEqual(result.parent, undefined, "parent of function call is undefined");
    });

    QUnit.load();
    QUnit.start();
});