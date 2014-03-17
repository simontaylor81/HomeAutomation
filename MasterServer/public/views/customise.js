// View that allows the user to customise their widgets.
define(['lib/page', 'lib/util', 'lib/databind', 'text!views/customise.html', './renderwidgets', 'handlebars'],
function (page, util, databind, html, renderwidgets, Handlebars) {

    var widgetData;
    var widgetControllers;
    var parentNode;

    // Data model, used for binding.
    var model = {
        save: {
            text: 'Save',
            action: saveWidgets,
            inProgress: false
        },

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

    // Delete a widget
    function deleteWidget(controller) {
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
        deleteRecursive(widgetData.widgets, controller.data);

        // Update the widgets
        updatePreview();
    }

    // Move a widget to make it a child of the target.
    function moveWidget(controllerToMove, targetController) {
        // Remove from previous position.
        deleteWidget(controllerToMove);

        // Insert to new location.
        targetController.data.children.push(controllerToMove.data);

        // Refresh preview.
        updatePreview();
    }

    // Delete the selected widget
    function deleteSelected() {
        var toDelete = model.selected.controller;
        model.selected.controller = null;
        deleteWidget(toDelete);
    }

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
            data: JSON.stringify(widgetData),
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

    function getWidgetIdFromElementId(id) {
        return id.slice(id.lastIndexOf('-') + 1);
    }
    function getWidgetFromElementId(id) {
        return widgetControllers[getWidgetIdFromElementId(id)];
    }

    // Defer update to next tick so we can call updatePreview multiple
    // times in succession without a performance hit.
    var updatePreview = util.deferredOperation(function () {
        var previewParent = $('#widget-preview', parentNode);

        var renderedWidgets = renderwidgets(widgetData);
        previewParent.html(renderedWidgets.html);
        widgetControllers = renderedWidgets.controllers;

        $('.ha-widget-container', previewParent)
        // Add click handler to each widget for selecting them.
        .click(util.preventDefaultEvent(function (event) {
            // Find the widget controller for the clicked on node.
            var controller = getWidgetFromElementId(this.id);

            model.selected.controller = controller;

            // Don't propagate up the tree -- only want to select the top-most widget.
            event.stopPropagation();
        }))
        // Make widgets draggable.
        .on('dragstart', onWidgetDragstart)
        .on('dragend', onWidgetDragend)
        //.on('dragover', onWidgetDragover)
        //.on('drop', onWidgetDrop)
        //.on('dragenter', onWidgetDragenter)
        //.on('dragleave', onWidgetDragleave)
        .children().attr('draggable', 'true');

        // Create drop targets (dropping on the actual elements is pretty broken in HTML, apparently).
        $('.ha-widget-container', previewParent).each(function () {
            $('<div class="drop-target">')
            .appendTo(previewParent)
            .attr('id', 'ha-widget-droptarget-' + getWidgetIdFromElementId(this.id))
            .on('dragenter', onWidgetDragenter)
            .on('dragleave', onWidgetDragleave)
            .on('dragover', onWidgetDragover)
            .on('drop', onWidgetDrop)
            ;
        });

        // TEMP
        //previewParent
        //.find('*')
        //.on('dragenter', function () { $(this).addClass('drag-over'); event.preventDefault(); })
        //.on('dragleave', function () { $(this).removeClass('drag-over'); event.preventDefault(); })

        // Re-apply selection highlight.
        setSelectionHighlight(model.selected.controller);
    });

    function resizeDropTargets() {
        $('.ha-widget-container', parentNode).each(function () {
            $('#ha-widget-droptarget-' + getWidgetIdFromElementId(this.id))
            // Slight hack: size based off first child, instead of the <span>,
            // as the span doesn't match the actual size.
            .offset($(this).children().offset())
            .width($(this).children().outerWidth())
            .height($(this).children().outerHeight())
            ;
        });
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

        // Drag n drop handlers for the trashcan.
        $('.trashcan', parentNode)
        .on('dragenter', function () { $(this).addClass('drag-over'); })
        .on('dragleave', function () { $(this).removeClass('drag-over'); })
        .on('dragover', onTrashcanDragover)
        .on('drop', onTrashcanDrop);
    }

    // Drag and drop handlers.
    var draggedWidget = null;

    function canDropOnWidget(element) {
        var targetWidget = getWidgetFromElementId(element.id);
        return draggedWidget && draggedWidget !== targetWidget && targetWidget.canHaveChildren;
    }

    function onWidgetDragenter() {
        if (canDropOnWidget(this)) {
            $('#ha-widget-' + getWidgetIdFromElementId(this.id)).addClass('drag-over');
        }
    }
    function onWidgetDragleave() {
        if (canDropOnWidget(this)) {
            $('#ha-widget-' + getWidgetIdFromElementId(this.id)).removeClass('drag-over');
        }
    }

    function onWidgetDragstart(event) {
        // Clear any selection.
        model.selected.controller = null;

        // Add drag-in-progress class to parent, so other elements can react to it.
        parentNode.addClass('drag-inprogress');

        // Add class to dragged element
        $(this).addClass('dragged');

        event.originalEvent.dataTransfer.effectAllowed = 'move';
        event.originalEvent.dataTransfer.setData('text', 'widget-drag');

        draggedWidget = getWidgetFromElementId(this.id);

        // Defer resize to next frame or Chrome breaks.
        setTimeout(resizeDropTargets, 0);

        // Don't propagate to parents.
        event.stopPropagation();
    }

    var onWidgetDragend = util.preventDefaultEvent(function (event) {
        // Remove classes.
        parentNode.removeClass('drag-inprogress');
        $(this).removeClass('dragged');
        $('.drag-over').removeClass('drag-over');

        draggedWidget = null;
    });

    function onWidgetDragover(event) {
        if (canDropOnWidget(this)) {
            event.preventDefault();
        }
    }

    function onWidgetDrop(event) {
        moveWidget(draggedWidget, getWidgetFromElementId(this.id));
        event.preventDefault();
    }

    function onTrashcanDragover(event) {
        if (draggedWidget) {
            event.preventDefault();
        }
    }
    function onTrashcanDrop(event) {
        if (draggedWidget) {
            event.preventDefault();
            event.stopPropagation();

            // Defer deletion until the next tick so the drag end events fire properly.
            var toDelete = draggedWidget;
            setTimeout(function () { deleteWidget(toDelete); }, 0);
        }
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
