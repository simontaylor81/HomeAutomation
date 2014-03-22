﻿// View model for the customise page.
define(['lib/util', 'lib/event'], function (util, Event) {

    // Constructor function
    function ViewModel() {
        var selfVM = this;

        this.widgetData = {};

        var _widgetControllers = [];
        Object.defineProperty(this, 'widgetControllers', {
            get: function () { return _widgetControllers; },
            set: function (value) {
                _widgetControllers = value;

                // New controllers means the selected controller is no longer valid.
                // So try to find the previously selected widget in the new list.
                if (this.selected.valid) {
                    var previousSelectionData = this.selected.controller.data;
                    this.selected.controller = value.find(function (c) { return c.data === previousSelectionData; });
                }
            }
        });

        Object.defineProperty, this, 'devices', {
            get: function () { return this.widgetData.devices; }
        };

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
            },
            {
                action: function () { selfVM.duplicate(selfVM.selected.controller); },
                label: "Duplicate",
                get available() { return selfVM.selected.valid; }
            },
            {
                action: function () { selfVM.moveRelative(selfVM.selected.controller, -1); },
                label: "Move up",
                get available() { return selfVM.selected.valid && selfVM.canMoveRelative(selfVM.selected.controller, -1); }
            },
            {
                action: function () { selfVM.moveRelative(selfVM.selected.controller, 1); },
                label: "Move down",
                get available() { return selfVM.selected.valid && selfVM.canMoveRelative(selfVM.selected.controller, 1); }
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
                                    enumType: prop.enumType
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

        this.enums = {
            get device() {
                // Available devices are the keys of the devices hash.
                return Object.keys(selfVM.widgetData.devices);
            }
        };

        // Always have the option of not having an icon.
        this.enums.icon = [''];

        // Find all font awesome icons.
        var faStylesheet = Array.prototype.find.call(
            document.styleSheets, function (ss) { return ss.href.contains('font-awesome'); });
        if (faStylesheet) {
            // Chrome adds an extra ':' before ':before' for some reason.
            var re = /^.fa-([a-z\-]+):?:before$/;
            this.enums.icon = this.enums.icon.concat(
                // Convert to array for simplicity.
                util.toArray(faStylesheet.cssRules)
                // Filter to only icon rules
                .filter(function (rule) {
                    return (rule instanceof CSSStyleRule) &&
                        re.test(rule.selectorText);
                })
                .map(function (rule) {
                    // Strip '.fa-' and ':before'
                    return re.exec(rule.selectorText)[1];
                }));
        };
    }

    // Get the array that containers the given widget's data (either
    // its parent's children array, or the top level widget array).
    function getContainingArray(controller, viewmodel) {
        return controller.parent ? controller.parent.data.children : viewmodel.widgetData.widgets
    }

    // Clone widget data to a new object.
    function cloneWidget(widget) {
        // Just convert to JSON and back: this mirrors the process of uploading to the server,
        // so is definitely correct, and its very simple.
        return JSON.parse(JSON.stringify(widget));
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

        // Remove from containing array.
        getContainingArray(controller, this).removeItem(controller.data);

        // Refresh preview.
        this.widgetsChanged.fire();
    };

    // Delete the selected widget
    ViewModel.prototype.deleteSelected = function () {
        var toDelete = this.selected.controller;
        this.selected.controller = null;
        this.deleteWidget(toDelete);
    };

    // Duplicate the selected widget
    ViewModel.prototype.duplicate = function (controller) {
        var parentArray = getContainingArray(controller, this);
        var oldIndex = parentArray.indexOf(controller.data);
        parentArray.splice(oldIndex + 1, 0, cloneWidget(controller.data));

        // Refresh preview.
        this.widgetsChanged.fire();
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

    // Change the given widget's position in the parent's child ordering.
    ViewModel.prototype.moveRelative = function (controller, amount) {
        var parentArray = getContainingArray(controller, this);
        var oldIndex = parentArray.indexOf(controller.data);

        // Remove from old position, and re-add in new one.
        parentArray.splice(oldIndex, 1);
        parentArray.splice(oldIndex + amount, 0, controller.data);

        // Refresh preview.
        this.widgetsChanged.fire();
    };

    // Is a matching call to moveRelative valid (i.e. is there something to move in front of?)
    ViewModel.prototype.canMoveRelative = function (controller, amount) {
        var parentArray = getContainingArray(controller, this);
        var newIndex = parentArray.indexOf(controller.data) + amount;
        return newIndex >= 0 && newIndex < parentArray.length;
    };

    ViewModel.prototype.getWidgetIdFromElementId = function (id) {
        return id.slice(id.lastIndexOf('-') + 1);
    };
    ViewModel.prototype.getWidgetFromElementId = function (id) {
        return this.widgetControllers[this.getWidgetIdFromElementId(id)];
    };

    return ViewModel;
});