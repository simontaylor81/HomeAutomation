// HTML data binding support.
define(['lib/util', 'lib/pathval'], function (util, pathval) {

    var bindings = [];

    // A binding that sets the text content of an element.
    function TextBinding(node, context) {
        this.node = node;
        this.path = $(node).attr('data-bind-text');
        this.context = context;
    }
    TextBinding.prototype.update = function () {
        $(this.node).text(pathval.get(this.context, this.path));
    };

    // A two-way binding for the value of an input element.
    function ValueBinding(node, context) {
        this.node = node;
        this.path = $(node).attr('data-bind-value');
        this.context = context;

        var self = this;

        // Change handler.
        $(node).on('input', function () {
            pathval.set(self.context, self.path, $(this).val());

            // When the value changes, we need to re-compute bindings,
            // as other stuff may depend on the value.
            // TODO: update just bindings for this context.
            updateBindings();
            //onChanged();
        });
    }
    ValueBinding.prototype.update = function () {
        // Only update if actually change to avoid losing caret position when typing.
        var newVal = pathval.get(this.context, this.path);
        if ($(this.node).val() !== newVal) {
            $(this.node).val(newVal);
        }
    };

    function initBinding(parent, rootContext) {
        // Add text bindings.
        $('[data-bind-text]', parent).each(function () {
            bindings.push(new TextBinding(this, rootContext));
        });

        // Value bindings.
        $('[data-bind-value]', parent).each(function () {
            bindings.push(new ValueBinding(this, rootContext));
        });

        // Find elments with a data context.
        //var boundContainers = $('[data-context]', parent);
        //boundContainers.each(function () {
        //    // Find context for this container.
        //    var contextIdentifier = $(this).attr('data-context');

        //    // Contents of the container are the handlebars template.
        //    var template = Handlebars.compile($(this).html());

        //    // Add this to the list of bindings that need to be updated.
        //    bindings.push({
        //        element: this,
        //        // Store context string rather than object itself in case the object changes.
        //        context: contextIdentifier,
        //        template: template,
        //        rootContext: rootContext
        //    });
        //});

        // Update bindings now.
        updateBindings();
    }

    function updateBindings() {
        bindings.forEach(function (binding) {
            binding.update();
        });

        //bindings.forEach(function (binding) {
        //    var context = getCurrentContext(binding);
        //    if (typeof context === 'undefined') { return; }

        //    var element = $(binding.element);

        //    // Re-run template.
        //    // Only one-way binding for now.
        //    element.html(binding.template(context))

        //    // Hook up links to actions.
        //    element.find('a[data-action]').click(util.preventDefaultEvent(function (event) {
        //        var action = $(this).attr('data-action');
        //        if (binding.rootContext[action]) {
        //            binding.rootContext[action](event);
        //        }
        //    }));

        //    // Hook up two-way bindings.
        //    initReverseBinding(binding);
        //});
    }

    // Set up event handlers to update the model based on user input.
    function initReverseBinding(binding) {
        var currentContext = getCurrentContext(binding);
        var element = $(binding.element);

        // Text inputs.
        element.find('input[type=text][data-bind]')
            // Set value to current value in context.
            .val(function () { return currentContext[$(this).attr('data-bind')]; })
            // Update context when the value changes.
            .on('input', function (event) {
                setInModel(binding, $(this).attr('data-bind'), $(this).val());

                // When the value changes, we need to re-compute bindings,
                // as other stuff may depend on the value.
                // TODO: update just this binding?
                updateBindings();
                //onChanged();
            });

        // Checkboxes.
//        parent.find('input[type=checkbox][data-bind]')
//            // Set value to current value in context.
//            .prop('checked', function () { return context[$(this).attr('data-bind')]; })
//            // Update context when the value changes.
//            .change(function () {
//                context[$(this).attr('data-bind')] = $(this).prop('checked');
//                onChanged();
//            });
    }

    // Get the current context object for a binding.
    function getCurrentContext(binding) {
        var currContext;
        if (binding.context === "" || binding.context === 'this') {
            // Bind to root for empty context string or 'this'
            currContext = binding.rootContext;
        } else {
            currContext = binding.rootContext[binding.context];
        }

        // If it's a function, call it.
        if (typeof currContext === 'function') {
            currContext = currContext();
        }
        return currContext;
    }

    // Set a property on the model to the given value.
    function setInModel(binding, identifier, newValue) {
        var currContext = getCurrentContext(binding);
        if (typeof currContext === 'undefined') { return; }

        // Set the property to the new value.
        currContext[identifier] = newValue;
    }

    // Module object.
    return {
        initBinding: initBinding,
        updateBindings: updateBindings
    };
});
