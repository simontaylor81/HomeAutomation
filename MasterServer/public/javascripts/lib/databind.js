// HTML data binding support.
define(['lib/util', 'lib/pathval'], function (util, pathval) {

    function getModelProp(context, path) {
        // Get property at the given path.
        return pathval.get(context, path);
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
    function TextBinding(element, model) {
        this.element = element;
        this.model = model;
        this.path = element.attr('data-bind-text');
    }
    TextBinding.prototype.update = function (context) {
        var newText = getModelProp(context, this.path);
        if (newText === undefined) {
            console.log('Could not bind text: ' + this.path);
            return;
        }
        this.element.text(newText);
    };

    // A two-way binding for the value of an input element.
    function ValueBinding(element, model) {
        this.element = element;
        this.model = model;
        this.path = element.attr('data-bind-value');

        var self = this;

        // Change handler.
        element.on('input', function () {
            setModelProp(self.context, self.path, $(this).val());

            // When the value changes, we need to re-compute bindings,
            // as other stuff may depend on the value.
            updateBindings(self.model);
        });
    }
    ValueBinding.prototype.update = function (context) {
        // Save context for change handler.
        this.context = context;

        // Only update if actually changed to avoid losing caret position when typing.
        var newVal = getModelProp(context, this.path);
        if (this.element.val() !== newVal) {
            this.element.val(newVal);
        }
    };

    // A two-way binding for the checked property of a checkbox input element.
    function CheckedBinding(element, model) {
        this.element = element;
        this.model = model;
        this.path = element.attr('data-bind-checked');

        var self = this;

        // Change handler.
        element.change(function () {
            setModelProp(self.context, self.path, $(this).prop('checked'));

            // When the value changes, we need to re-compute bindings,
            // as other stuff may depend on the value.
            updateBindings(self.model);
        });
    }
    CheckedBinding.prototype.update = function (context) {
        // Save context for change handler.
        this.context = context;

        var newVal = getModelProp(context, this.path);
        if (newVal === undefined) {
            console.log('Could not bind value: ' + this.path);
            return;
        }

        if (this.element.prop('checked') !== newVal) {
            this.element.prop('checked', newVal);
        }
    };

    function ClickBinding(element, model) {
        this.element = element;
        this.model = model;
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
    }
    ClickBinding.prototype.update = function (context) {
        // Save context for change handler.
        this.context = context;
    };

    function VisibilityBinding(element, model) {
        this.element = element;
        this.model = model;
        this.path = element.attr('data-bind-visibility');
    }
    VisibilityBinding.prototype.update = function (context) {
        var visibility = getModelProp(context, this.path);
        this.element.toggle(Boolean(visibility));
    };

    // A binding that generates its contents once for each item in an array.
    function EachBinding(element, model) {
        this.element = element;
        this.model = model;
        this.path = element.attr('data-bind-each');
        this.template = element.children().clone();
        this.currSize = 1;          // Start with a single child.

        // Init bindings for initial single child.
        this.children = [];     // Array of arrays of child bindings.
        this.children[0] = [];
        appendBindings(element.children(), this.model, this.children[0]);
    }
    EachBinding.prototype.update = function (context) {
        var childElements, i;

        // Bound object must be array-like.
        var array = getModelProp(context, this.path);
        if (array === undefined) {
            console.log('Could not bind each: ' + this.path);
            return;
        }
        if (util.isUndefined(array.length) || util.isUndefined(array.forEach)) {
            console.log('each binding must be an array');
            return;
        }

        // TODO: Don't completely regenerate from scratch
        if (array.length !== this.currSize) {
            // TODO: Clean up previous bindings.

            // Array has changed, so re-generate contents.
            this.element.empty();
            this.children = [];

            //array.forEach(function (childContext) {
            for (i = 0; i < array.length; i++) {
                // Create a new copy of the template and add it to ourselves.
                childElements = this.template.clone().appendTo(this.element);

                // Init bindings for the new copy.
                this.children[i] = [];
                appendBindings(childElements, this.model, this.children[i]);
            }
            this.currSize = array.length;
        }

        // Update all children.
        for (i = 0; i < array.length; i++) {
            this.children[i].forEach(function (child) { child.update(array[i]); });
        }
    };

    // A binding that generates child items only if the binding expression is true.
    function IfBinding(element, model) {
        this.element = element;
        this.model = model;
        this.path = element.attr('data-bind-if');
        this.attached = true;

        // Manage our own children.
        this.childBindings = [];
        appendBindings(element.children(), model, this.childBindings);
    }
    IfBinding.prototype.update = function (context) {
        var condition = getModelProp(context, this.path);
        if (condition) {
            if (!this.attached) {
                this.element.append(this.childElements);
                this.attached = true;
            }
        } else {
            if (this.attached) {
                this.childElements = this.element.children().detach();
                this.attached = false;
            }
        }

        if (this.attached) {
            // Update all children.
            this.childBindings.forEach(function (child) { child.update(context); });
        }
    };

    // Handy helpers for determining if an element has an attribute/one of a list of attributes.
    $.fn.hasAttr = function (attr) {
        return this.attr(attr) !== undefined;
    };
    $.fn.hasAnyAttr = function (attrs) {
        return attrs.some(function (attr) { return this.hasAttr(attr); }, this);
    };

    function appendBindings(elements, model, bindings) {
        elements.each(function () {
            var element = $(this);
            var prevNumBindings = bindings.length;
            var bRecurseToChildren = true;

            // Mutually exclusive bindings.
            if (element.hasAttr('data-bind-each')) {
                bindings.push(new EachBinding(element, model));

                // Don't recurse to children -- they require special handling.
                bRecurseToChildren = false;
            } else if (element.hasAttr('data-bind-if')) {
                bindings.push(new IfBinding(element, model));

                // Don't recurse to children -- they're handled by the binding.
                bRecurseToChildren = false;
            } else if (element.hasAttr('data-bind-text')) {
                bindings.push(new TextBinding(element, model));

                // Don't recurse to children -- we're going to replace the contents with the bound text.
                bRecurseToChildren = false;
            } else if (element.hasAttr('data-bind-value')) {
                bindings.push(new ValueBinding(element, model));
            } else if (element.hasAttr('data-bind-checked')) {
                bindings.push(new CheckedBinding(element, model));
            }

            // Bindings that any node can have.
            if (element.hasAttr('data-bind-click')) {
                bindings.push(new ClickBinding(element, model));
            }
            if (element.hasAttr('data-bind-visibility')) {
                bindings.push(new VisibilityBinding(element, model));
            }

            // Only recurse to children if they're not already handled/disallowed by a binding.
            if (bRecurseToChildren) {
                appendBindings(element.children(), model, bindings);
            }
        });
    }

    var allBindings = [];

    function findBindingsIndex(modelOrElement) {
        if (modelOrElement instanceof jQuery) {
            // Look for bindings for this element
            return allBindings.findIndex(function (b) { return b.rootElement === modelOrElement; });
        } else {
            // Look for bindings for this model
            return allBindings.findIndex(function (b) { return b.model === modelOrElement; });
        }
    }

    function findBindings(modelOrElement) {
        var index = findBindingsIndex(modelOrElement);
        return (index >= 0) ? allBindings[index] : undefined;
    }

    function initBinding(rootElement, model) {

        // Check we haven't already got bindings for either this element or model.
        if (findBindings(rootElement)) {
            console.log('Bindings already initialised for element');
            return;
        }
        if (findBindings(model)) {
            console.log('Bindings already initialised for model');
            return;
        }

        // Create new bindings container and create the actual bindings for it.
        var newBindings = {
            rootElement: rootElement,
            model: model,
            bindings: []
        };
        appendBindings(rootElement, model, newBindings.bindings);

        // Add to list of all managed bindings.
        allBindings.push(newBindings);

        // Update bindings now.
        newBindings.bindings.forEach(function (binding) {
            binding.update(model);
        });
    }

    function cleanupBinding(modelOrElement) {
        var index = findBindingsIndex(modelOrElement);
        if (index >= 0) {
            allBindings.splice(index, 1);
        }
    }

    function updateBindings(modelOrElement) {
        var bindings = findBindings(modelOrElement);
        if (bindings) {
            // Update each binding.
            bindings.bindings.forEach(function (binding) {
                binding.update(bindings.model);
            });
        } else {
            console.log('Could not find bindings to update');
        }
    }

    // Module object.
    return {
        initBinding: initBinding,
        cleanupBinding: cleanupBinding,
        updateBindings: updateBindings
    };
});
