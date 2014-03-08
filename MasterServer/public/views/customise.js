// View that allows the user to customise their widgets.
define(['lib/page', 'lib/util', 'lib/databind', 'text!views/customise.html', './renderwidgets', 'handlebars'],
function (page, util, databind, html, renderwidgets, Handlebars) {

    var widgetData;
    var parentNode;

    // Data model, used for binding.
    var model = {
        actions: [
            {
                action: addGroup,
                label: "Add Group",
                available: true
            },
            {
                action: addButton,
                label: "Add Button",
                get available() {
                    return model.selected.valid && model.selected.type === 'group';
                }
            },
            {
                action: deleteSelected,
                label: "Delete Selected",
                get available() { return model.selected.valid; }
            }
        ],

        selected: {
            get valid() { return Boolean(this._controller) },
            get type() {
                return this._controller ? this._controller.data.type : '';
            },
            props: [],

            get controller() { return this._controller; },
            set controller(newController) {
                this._controller = newController;

                // Contruct props list.
                if (newController) {
                    this.props = newController.getCustomisableProperties().map(function (prop) {
                        var result = {
                            name: prop.friendly,
                            get value() { return newController.data[prop.property]; },
                            set value(x) {
                                newController.data[prop.property] = x;
                                updatePreview();
                            },
                        };

                        result['is' + prop.type] = true;
                        return result;
                    });
                } else {
                    this.props = [];
                }

                // Update selection highlight and data bindings.
                setSelectionHighlight(newController);
                databind.updateBindings(model);
            },

            _controller: null
        }
    };

    function addGroup() {
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

    function addButton() {
        model.selected.controller.data.children.push({
            type: "button",
            caption: "New Button",
        });

        // Refresh preview.
        updatePreview();
    }

    // Delete the selected widget
    function deleteSelected() {
        function deleteRecursive(widgets, toDelete) {
            for (var i = 0; i < widgets.length; i++) {
                if (widgets[i] === toDelete) {
                    // Found it -- remove it from the array.
                    widgets.splice(i, 1);
                    return true;
                }

                // Not this one, so try children, if we have any.
                if (widgets[i].children && deleteRecursive(widgets[i].children, toDelete)) {
                    return true;
                }
            }

            return false;
        }

        // Recurse through the widget tree looking for the selected one.
        deleteRecursive(widgetData.widgets, model.selected.controller.data);

        model.selected.controller = null;
        updatePreview();
    }

    function updatePreview() {
        var renderedWidgets = renderwidgets(widgetData);
        $('#widget-preview', parentNode).html(renderedWidgets.html);

        // Add click handler to each widget for selecting them.
        $('.ha-widget-container', parentNode).click(util.preventDefaultEvent(function (event) {
            // Find the widget controller for the clicked on node.
            var widgetId = $(this).attr('id').slice(10);
            var controller = renderedWidgets.controllers[widgetId];

            model.selected.controller = controller;

            // Don't propagate up the tree -- only want to select the top-most widget.
            event.stopPropagation();
        }));

        // Re-apply selection highlight.
        setSelectionHighlight(model.selected.controller);
    }

    function setSelectionHighlight(controller) {
        // Clear any existing selected class.
        $('.ha-widget-container', parentNode).removeClass('ha-selected-widget');

        if (controller) {
            // Set selected class on this widget.
            $('#ha-widget-' + controller.id, parentNode).addClass('ha-selected-widget');
        }
    }

    function initPage() {
        // Set up data binding.
        databind.initBinding(parentNode, model);

        // Clicking somewhere not on a widget clears selection.
        parentNode.click(function () { model.selected.controller = null; });

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
        exit: function () {
            databind.cleanupBinding(model);
        }
    };
});
