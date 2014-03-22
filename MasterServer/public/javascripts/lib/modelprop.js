// Module for getting and setting properties in the model, given a string expression.
define(['jsep'], function (jsep) {

    // Evaluate a parse tree node.
    function evalNode(context, rootContext, node) {
        // To save typing.
        function result(value, parent) { return { value: value, parent: parent }; }

        switch (node.type) {
            case 'Literal':
                return result(node.value);

            case 'Identifier':
                return node.name === '$root' ? result(rootContext) : result(context[node.name], context);

            case 'ThisExpression':
                return result(context);

            case 'MemberExpression':
                // Evaluate LHS
                var lhs = evalNode(context, rootContext, node.object).value;
                if (!lhs) {
                    return result();
                }

                // RHS can be 'computed' or just a member access.
                var rhs;
                if (node.computed) {
                    rhs = evalNode(context, rootContext, node.property).value;
                } else {
                    rhs = node.property.name;
                }

                return result(lhs[rhs], lhs);

            case 'CallExpression':
                var fn = evalNode(context, rootContext, node.callee);
                var args = node.arguments.map(function (arg) { return evalNode(context, rootContext, arg).value; });
                if (typeof fn.value !== 'function') {
                    return result();
                }
                return result(fn.value.apply(fn.parent, args));
        }

        throw new Error('Unsupported expression');
    }

    // Get the value of the expression, given context and root.
    function get(context, rootContext, expression) {
        return getWithParent(context, rootContext, expression).value;
    }

    // Get the value of the expression, and its parent object, given context and root.
    function getWithParent(context, rootContext, expression) {
        var parseTree = jsep(expression);
        return evalNode(context, rootContext, parseTree);
    }

    // Set the value of the expression, given context and root.
    function set(context, rootContext, expression, value) {
        var parseTree = jsep(expression);

        // No recursion for setting -- we only set once.
        switch (parseTree.type) {
            case 'Literal':
                throw new Error('Cannot set the value of a literal');

            case 'Identifier':
                if (parseTree.name === '$root') {
                    throw new Error('Cannot set the value of the root context');
                }
                context[parseTree.name] = value;
                return;

            case 'ThisExpression':
                throw new Error('Cannot set the value of this');

            case 'MemberExpression':
                // Evaluate LHS
                var lhs = evalNode(context, rootContext, parseTree.object).value;
                if (!lhs) {
                    // Fail silently on invalid access
                    return;
                }

                // RHS can be 'computed' or just a member access.
                var rhs;
                if (parseTree.computed) {
                    rhs = evalNode(context, rootContext, parseTree.property).value;
                } else {
                    rhs = parseTree.property.name;
                }
                
                lhs[rhs] = value;
                return;

            case 'CallExpression':
                throw new Error('Cannot set the value of a function call');
        }

        throw new Error('Unsupported expression');
    }


    return {
        get: get,
        getWithParent: getWithParent,
        set: set
    };
});