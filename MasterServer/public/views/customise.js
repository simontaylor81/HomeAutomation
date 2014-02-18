// View that allows the user to customise their widgets.
define(['lib/page', 'lib/util', 'text!views/customise.html', './renderwidgets'], function (page, util, html, renderwidgets) {

    var widgetData;
    var parentNode;

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
        var panel = $('#selected-widget-panel', parentNode);

        // Clear any existing selected class.
        $('.ha-widget-container', parentNode).removeClass('ha-selected-widget');

        if (controller) {
            // Set selected class on this widget.
            node.addClass('ha-selected-widget');

            // Show the details panel.
            panel.show();

            var tableBody = $('tbody', panel)

            // Add type row (handled specially as it is read-only, and common to all widgets).
            tableBody.html('<tr><td>Type</td><td>' + controller.data.type + '</td></tr>');

            // Get the customisable properties for this widget.
            var props = controller.getCustomisableProperties();
            props.forEach(function (prop) {
                tableBody
                    .append($('<tr>')
                        .append($('<td>').html(prop.friendly))
                        .append($('<td>').append(
                            getEditControl(prop.type).attr('data-bind', prop.property)))
                    );
            });

            // Hook up bound elements.
            initDataBinding(tableBody, controller.data, updatePreview);
        } else {
            // Hide the details panel.
            panel.hide();
        }
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

    // Action functions for links on the page.
    var actions = {
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
        }
    };

    function initPage() {
        setSelected(null);

        // Hook up links to actions.
        $('a[data-action]', parentNode)
        .click(function (event) {
            // Don't actually follow the link.
            event.preventDefault();

            var action = $(this).attr('data-action');
            if (actions[action]) {
                actions[action]();
            }
        });

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
