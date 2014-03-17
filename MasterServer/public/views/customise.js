// View that allows the user to customise their widgets.
define(['lib/page', 'lib/util', 'lib/databind', 'text!views/customise.html', './renderwidgets', './customise-draganddrop'],
function (page, util, databind, html, renderwidgets, draganddrop) {

    var parentNode;

    // Data model, used for binding.
    var model = {
        widgetData: {},
        widgetControllers: [],

        save: {
            text: 'Save',
            action: saveWidgets,
            inProgress: false
        },

        actions: [
            {
                action: function () { model.addGroup(); },
                label: "Add Group",
                available: true
            },
            {
                action: function () { model.addButton(model.selected.controller); },
                label: "Add Button",
                get available() {
                    return model.selected.valid && model.selected.type === 'group';
                }
            },
            {
                action: function () { model.deleteSelected(); },
                label: "Delete Selected",
                get available() { return model.selected.valid; }
            }
        ],

        selected: {
            get valid() { return Boolean(this._controller); },
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
        },

        addGroup: function () {
            // Add new group widget.
            this.widgetData.widgets.push({
                "type": "group",
                "caption": "New Group",
                "status": false,
                "children": []
            });

            // Refresh preview.
            updatePreview();
        },

        addButton: function (parent) {
            parent.data.children.push({
                type: "button",
                caption: "New Button",
            });

            // Refresh preview.
            updatePreview();
        },

        // Delete a widget
        deleteWidget: function (controller) {
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

            // Recurse through the widget tree looking for the one to delete.
            deleteRecursive(this.widgetData.widgets, controller.data);

            // Update the widgets
            updatePreview();
        },

        // Delete the selected widget
        deleteSelected: function () {
            var toDelete = this.selected.controller;
            this.selected.controller = null;
            this.deleteWidget(toDelete);
        },

        // Move a widget to make it a child of the target.
        moveWidget: function (controllerToMove, targetController) {
            // Remove from previous position.
            this.deleteWidget(controllerToMove);

            // Insert to new location.
            targetController.data.children.push(controllerToMove.data);

            // Refresh preview.
            updatePreview();
        },

        getWidgetIdFromElementId: function (id) {
            return id.slice(id.lastIndexOf('-') + 1);
        },
        getWidgetFromElementId: function (id) {
            return this.widgetControllers[this.getWidgetIdFromElementId(id)];
        }
    };

    // Save the widgets back to the user's account.
    function saveWidgets() {
        model.save.text = 'Saving...';
        model.save.inProgress = true;
        databind.updateBindings(model);

        // POST widgets to the server.
        $.ajax({
            url: 'user/widgets',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(model.widgetData),
        })
        .success(function (data) {
            showSuccessAlert('Widgets saved');
        })
        .fail(function (jqxhr, textError, errorThrown) {
            if (jqxhr.status === 403) {
                // Handle this somehow?
                page('login');
            } else {
                alert('Failed to save widgets: ' + errorThrown);
            }
        })
        .always(function () {
            model.save.text = 'Save';
            model.save.inProgress = false;
            databind.updateBindings(model);
        });
    }

    // Defer update to next tick so we can call updatePreview multiple
    // times in succession without a performance hit.
    var updatePreview = util.deferredOperation(function () {
        var previewParent = $('#widget-preview', parentNode);

        var renderedWidgets = renderwidgets(model.widgetData);
        previewParent.html(renderedWidgets.html);
        model.widgetControllers = renderedWidgets.controllers;

        // Add click handler to each widget for selecting them.
        $('.ha-widget-container', previewParent)
        .click(util.preventDefaultEvent(function (event) {
            // Find the widget controller for the clicked on node.
            var controller = model.getWidgetFromElementId(this.id);

            model.selected.controller = controller;

            // Don't propagate up the tree -- only want to select the top-most widget.
            event.stopPropagation();
        }));

        // Re-apply selection highlight.
        setSelectionHighlight(model.selected.controller);

        // Set up drag and drop stuff.
        draganddrop.initWidgets();
    });

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

        // Initialise drag and drop.
        draganddrop.initPage(parentNode, model);
    }

    function showSuccessAlert(message) {
        $('#success-alert')
            // Set message text.
            .text(message)
            // Show the alert.
            .removeClass('opacity-fade-hide');

        // Start fading out after 1 second.
        setTimeout(function () {
            $('#success-alert').addClass('opacity-fade-hide');
        }, 1000);
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

                model.widgetData = data;

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
