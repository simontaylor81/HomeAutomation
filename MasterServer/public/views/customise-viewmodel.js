// View model for the customise page.
define(['lib/util', 'lib/event'], function (util, Event) {

    // Constructor function
    function ViewModel() {
        var selfVM = this;

        this.widgetData = {};
        this.widgetControllers = [];

        // Events
        this.saveFired = new Event();
        this.widgetsChanged = new Event();
        this.dataChanged = new Event();
        this.selectionChanged = new Event();

        this.save = {
            text: 'Save',
            action: function () { selfVM.saveFired.fire(); },
            inProgress: false
        };

        this.actions = [
            {
                action: function () { selfVM.addGroup(); },
                label: "Add Group",
                available: true
            },
            {
                action: function () { selfVM.addButton(selfVM.selected.controller); },
                label: "Add Button",
                get available() {
                    return selfVM.selected.valid && selfVM.selected.type === 'group';
                }
            },
            {
                action: function () { selfVM.deleteSelected(); },
                label: "Delete Selected",
                get available() { return selfVM.selected.valid; }
            }
        ];

        this.selected = new (function () {
            var _controller = null;

            this.props = [];

            Object.defineProperties(this, {
                valid: { get: function () { return Boolean(_controller); } },
                type: { get: function () { return _controller ? _controller.data.type : ''; } },
                controller: {
                    get: function () { return _controller; },
                    set: function (newController) {
                        _controller = newController;

                        // Contruct props list.
                        if (newController) {
                            this.props = newController.getCustomisableProperties().map(function (prop) {
                                var result = {
                                    name: prop.friendly,
                                    get value() { return newController.data[prop.property]; },
                                    set value(x) {
                                        newController.data[prop.property] = x;
                                        selfVM.widgetsChanged.fire();
                                    },
                                };

                                result['is' + prop.type] = true;
                                return result;
                            });
                        } else {
                            this.props = [];
                        }

                        // Update selection highlight and data bindings.
                        selfVM.selectionChanged.fire();
                        selfVM.dataChanged.fire();
                    }
                }
            });
        })();
    }

    ViewModel.prototype.addGroup = function () {
        // Add new group widget.
        this.widgetData.widgets.push({
            "type": "group",
            "caption": "New Group",
            "status": false,
            "children": []
        });

        // Refresh preview.
        this.widgetsChanged.fire();
    };

    ViewModel.prototype.addButton = function (parent) {
        parent.data.children.push({
            type: "button",
            caption: "New Button",
        });

        // Refresh preview.
        this.widgetsChanged.fire();
    };

    // Delete a widget
    ViewModel.prototype.deleteWidget = function (controller) {
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
        this.widgetsChanged.fire();
    };

    // Delete the selected widget
    ViewModel.prototype.deleteSelected = function () {
        var toDelete = this.selected.controller;
        this.selected.controller = null;
        this.deleteWidget(toDelete);
    };

    // Move a widget to make it a child of the target.
    ViewModel.prototype.moveWidget = function (controllerToMove, targetController) {
        // Remove from previous position.
        this.deleteWidget(controllerToMove);

        // Insert to new location.
        targetController.data.children.push(controllerToMove.data);

        // Refresh preview.
        this.widgetsChanged.fire();
    };

    ViewModel.prototype.getWidgetIdFromElementId = function (id) {
        return id.slice(id.lastIndexOf('-') + 1);
    };
    ViewModel.prototype.getWidgetFromElementId = function (id) {
        return this.widgetControllers[this.getWidgetIdFromElementId(id)];
    };

    return ViewModel;
});