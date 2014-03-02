// HTML data binding support.
define(['lib/util', 'lib/pathval'], function (util, pathval) {

    function getModelProp(context, path) {
        // Get property at the given path.
        var prop = pathval.get(context, path);

        // Is it a property wrapper?
        if (typeof prop === 'object' && prop.get !== undefined) {
            prop = prop.get();
        }

        return prop;
    }

    function setModelProp(context, path, value) {
        // Get existing value.
        var existingVal = pathval.get(context, path);

        // Is it a property wrapper?
        if (typeof prop === 'object' && prop.set !== undefined) {
            // Call setter
            existingVal.set(value);
        } else {
            // Check that the value has actually changed.
            if (existingVal !== value) {
                pathval.set(context, path, value);
            }
        }
    }

    // A binding that sets the text content of an element.
    function TextBinding(element, context) {
        this.element = element;
        this.context = context;
        this.path = element.attr('data-bind-text');
    }
    TextBinding.prototype.update = function () {
        var newText = getModelProp(this.context, this.path);
        if (newText === undefined) {
            console.log('Could not bind text: ' + this.path);
        }
        this.element.text(newText);
    };

    // A two-way binding for the value of an input element.
    function ValueBinding(element, context) {
        this.element = element;
        this.context = context;
        this.path = element.attr('data-bind-value');

        var self = this;

        // Change handler.
        element.on('input', function () {
            setModelProp(self.context, self.path, $(this).val());

            // When the value changes, we need to re-compute bindings,
            // as other stuff may depend on the value.
            // TODO: update just bindings for this context.
            updateBindings();
        });
    }
    ValueBinding.prototype.update = function () {
        var newVal = getModelProp(this.context, this.path);
        if (newVal === undefined) {
            console.log('Could not bind value: ' + this.path);
        }

        // Only update if actually changed to avoid losing caret position when typing.
        if (this.element.val() !== newVal) {
            this.element.val(newVal);
        }
    };

    // A two-way binding for the checked property of a checkbox input element.
    function CheckedBinding(element, context) {
        this.element = element;
        this.context = context;
        this.path = element.attr('data-bind-checked');

        var self = this;

        // Change handler.
        element.change(function () {
            setModelProp(self.context, self.path, $(this).prop('checked'));

            // When the value changes, we need to re-compute bindings,
            // as other stuff may depend on the value.
            // TODO: update just bindings for this context.
            updateBindings();
        });
    }
    CheckedBinding.prototype.update = function () {
        var newVal = getModelProp(this.context, this.path);
        if (newVal === undefined) {
            console.log('Could not bind value: ' + this.path);
        }

        if (this.element.prop('checked') !== newVal) {
            this.element.prop('checked', newVal);
        }
    };

    function ClickBinding(element, context) {
        this.element = element;
        this.context = context;
        this.path = element.attr('data-bind-click');

        var self = this;

        // Click event handler.
        element.click(util.preventDefaultEvent(function (event) {
            var action = getModelProp(self.context, self.path);
            if (action === undefined) {
                console.log('Failed to bind action: ' + self.path);
                return;
            }
            
            action(event);
        }));

        // Look for children.
        this.children = [];
        appendBindings(element.children(), context, this.children);
    }
    ClickBinding.prototype.update = function () {
        // Nothing to update ourselves, just recurse to children.
        this.children.forEach(function (child) { child.update(); });
    };

    function VisibilityBinding(element, context) {
        this.element = element;
        this.context = context;
        this.path = element.attr('data-bind-visibility');

        // Look for children.
        this.children = [];
        appendBindings(element.children(), context, this.children);
    }
    VisibilityBinding.prototype.update = function () {
        var visibility = getModelProp(this.context, this.path);
        this.element.toggle(Boolean(visibility));

        // Recurse to children.
        this.children.forEach(function (child) { child.update(); });
    };

    // A binding that generates its contents once for each item in an array.
    function EachBinding(element, context) {
        this.element = element;
        this.context = context;
        this.path = element.attr('data-bind-each');
        this.template = element.children().clone();
        this.currSize = -1;         // Force regeneration on first update.
    }
    EachBinding.prototype.update = function () {
        var childElements;
        var self = this;

        // Bound object must be array-like.
        var array = getModelProp(this.context, this.path);
        if (util.isUndefined(array.length) || util.isUndefined(array.forEach)) {
            console.log('each binding must be an array');
            return;
        }

        // TODO: Detect changes that don't alter size.
        if (array.length !== this.currSize) {
            // TODO: Clean up previous bindings.
            // Array has changed, so re-generate contents.
            this.element.html('');
            this.children = [];

            array.forEach(function (childContext) {
                // Create a new copy of the template and add it to ourselves.
                childElements = self.template.clone().appendTo(self.element);

                // Init bindings for the new copy.
                appendBindings(childElements, childContext, self.children);
            });
            this.currSize = array.length;
        }

        // Update all children.
        this.children.forEach(function (child) { child.update(); });
    };

    // Handy helpers for determining if an element has an attribute/one of a list of attributes.
    $.fn.hasAttr = function (attr) {
        return this.attr(attr) !== undefined;
    };
    $.fn.hasAnyAttr = function (attrs) {
        return attrs.some(function (attr) { return this.hasAttr(attr); }, this);
    };

    function appendBindings(elements, context, bindings) {
        elements.each(function () {
            var element = $(this);
            var prevNumBindings = bindings.length;

            // Create the appropriate binding.
            // Each bindings are mutually exclusive with those that affect the content.
            if (element.hasAttr('data-bind-each')) {
                bindings.push(new EachBinding(element, context));
            } else {
                // Can't set text *and* value.
                if (element.hasAttr('data-bind-text')) {
                    bindings.push(new TextBinding(element, context));
                } else if (element.hasAttr('data-bind-value')) {
                    bindings.push(new ValueBinding(element, context));
                } else if (element.hasAttr('data-bind-checked')) {
                    bindings.push(new CheckedBinding(element, context));
                }

                if (element.hasAttr('data-bind-click')) {
                    bindings.push(new ClickBinding(element, context));
                }
                if (element.hasAttr('data-bind-visibility')) {
                    bindings.push(new VisibilityBinding(element, context));
                }
            }

            // Did we actually add any bindings?
            if (bindings.length === prevNumBindings) {
                // No, so it's a regular unbound element, so recurse to children.
                appendBindings(element.children(), context, bindings);
            }
        });
    }

    var allBindings = [];

    function initBinding(parent, rootContext) {

        appendBindings(parent, rootContext, allBindings);

        // Update bindings now.
        updateBindings();
    }

    function updateBindings() {
        allBindings.forEach(function (binding) {
            binding.update();
        });
    }

    // Module object.
    return {
        initBinding: initBinding,
        updateBindings: updateBindings
    };
});
