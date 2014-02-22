// View that allows the user to customise their widgets.
define(['lib/page', 'lib/util', 'text!views/customise.html', './renderwidgets', 'handlebars'],
function (page, util, html, renderwidgets, Handlebars) {

    var widgetData;
    var parentNode;
    var selectedWidget = null;

    // Data model, used for binding.
    var model = {
        actions: getActions,

        addGroup: function () {
            // Add new group widget.
            widgetData.widgets.push({
                "type": "group",
                "caption": "New Group",
                "status": false,
                "children": []
            });

            // Refresh preview.
            updatePreview();
        },

        addButton: function () {
            selectedWidget.data.children.push({
                type: "button",
                caption: "New Button",
            });

            // Refresh preview.
            updatePreview();
        }
    };

    function updatePreview() {
        var renderedWidgets = renderwidgets(widgetData);
        $('#widget-preview', parentNode).html(renderedWidgets.html);

        // Add click handler to each widget for selecting them.
        $('.ha-widget-container', parentNode).click(util.preventDefaultEvent(function (event) {
            // Find the widget controller for the clicked on node.
            var widgetId = $(this).attr('id').slice(10);
            var controller = renderedWidgets.controllers[widgetId];

            setSelected(controller, $(this));

            // Don't propagate up the tree -- only want to select the top-most widget.
            event.stopPropagation();
        }));
    }

    function setSelected(controller, node) {
        selectedWidget = controller;
        var panel = $('#selected-widget-panel', parentNode);

        // Clear any existing selected class.
        $('.ha-widget-container', parentNode).removeClass('ha-selected-widget');

        if (selectedWidget) {
            // Set selected class on this widget.
            node.addClass('ha-selected-widget');

            // Show the details panel.
            panel.show();

            var tableBody = $('tbody', panel)

            // Add type row (handled specially as it is read-only, and common to all widgets).
            tableBody.html('<tr><td>Type</td><td>' + selectedWidget.data.type + '</td></tr>');

            // Get the customisable properties for this widget.
            var props = selectedWidget.getCustomisableProperties();
            props.forEach(function (prop) {
                tableBody
                    .append($('<tr>')
                        .append($('<td>').html(prop.friendly))
                        .append($('<td>').append(
                            getEditControl(prop.type).attr('data-bind', prop.property)))
                    );
            });

            // Hook up bound elements.
            initDataBinding(tableBody, selectedWidget.data, updatePreview);
        } else {
            // Hide the details panel.
            panel.hide();
        }

        // Update data binding -- available actions may have changed.
        updateDataBinding();
    }

    function getActions() {
        // Actions that are always available.
        var actions = [
            {
                action: "addGroup",
                label: "Add Group"
            }
        ];

        // For groups, we can also add a button to the group.
        if (selectedWidget && selectedWidget.data.type === 'group') {
            actions.push({
                action: "addButton",
                label: "Add Button"
            });
        }

        return actions;
    }

    function getEditControl(type) {
        if (type === 'text') {
            // Text input
            return $('<input type="text" class="form-control">');
        } else if (type === 'bool') {
            // Checkbox for bools.
            return $('<input type="checkbox">');
        }
    }

    var bindings = [];

    function initPageDataBinding(parent, rootContext) {
        // Find elments with a data context.
        var boundContainers = $('[data-context]', parent);
        boundContainers.each(function () {
            // Find context for this container.
            var contextIdentifier = $(this).attr('data-context');

            // Contents of the container are the handlebars template.
            var template = Handlebars.compile($(this).html());

            // Add this to the list of bindings that need to be updated.
            bindings.push({
                element: this,
                // Store function to retrieve context rather than context itself in case it changes.
                getContext: function () { return rootContext[contextIdentifier]; },
                template: template,
                rootContext: rootContext
            });
        });

        // Update bindings now.
        updateDataBinding();
    }

    function updateDataBinding() {
        bindings.forEach(function (binding) {
            // Get context object.
            var context = binding.getContext();
            if (typeof context === 'function') {
                context = context();
            }

            // Re-run template.
            // Only one-way binding for now.
            $(binding.element)
                .html(binding.template(context))

                // Hook up links to actions.
                .find('a[data-action]')
                    .click(util.preventDefaultEvent(function (event) {
                        var action = $(this).attr('data-action');
                        if (binding.rootContext[action]) {
                            binding.rootContext[action](event);
                        }
                    }));
        });
    }

    function initDataBinding(parent, context, onChanged) {
        // Text inputs.
        parent.find('input[type=text][data-bind]')
            // Set value to current value in context.
            .val(function () { return context[$(this).attr('data-bind')]; })
            // Update context when the value changes.
            .change(function () {
                context[$(this).attr('data-bind')] = $(this).val();
                onChanged();
            });

        // Checkboxes.
        parent.find('input[type=checkbox][data-bind]')
            // Set value to current value in context.
            .prop('checked', function () { return context[$(this).attr('data-bind')]; })
            // Update context when the value changes.
            .change(function () {
                context[$(this).attr('data-bind')] = $(this).prop('checked');
                onChanged();
            });
    }

    function initPage() {
        setSelected(null);

        // Set up data binding.
        initPageDataBinding(parentNode, model);

        // Clicking somewhere not on a widget clears selection.
        parentNode.click(function () { setSelected(null); });

        // But we don't want to do this for the edit pane, so prevent clicks bubbling up from there.
        $('#edit-pane').click(function (event) { event.stopPropagation(); });
    }

    // Module object
    return {
        enter: function (pageContent) {

            // Load list of widgets.
            $.ajax({
                url: 'user/widgets',
                // TEMP!
                //url: 'test/controllist.json',
                cache: false
            })
            .success(function (data) {
                // Set logged in state (shows logout and customise buttons).
                page.setLoggedIn(true);

                // Set page content to the loaded html.
                parentNode = pageContent;
                pageContent.html(html);
                initPage();

                widgetData = data;

                // Render initial widgets and add to page.
                updatePreview();
            })
            .fail(function (jqxhr, textError, errorThrown) {
                if (jqxhr.status === 403) {
                    // Redirect to the login page.
                    page('login');
                } else {
                    pageContent.html('ERROR getting widget list: ' + textError);
                }
            });
        },
        exit: function () {}
    };
});
