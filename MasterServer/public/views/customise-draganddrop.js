// Drag and drop functionality for the customise view.
define(['lib/util'], function (util) {

    var draggedWidget = null;
    var parentNode;
    var viewmodel;

    // Resize the invisible drop target elements to match the actual widgets.
    function resizeDropTargets() {
        $('.ha-widget-container', parentNode).each(function () {
            $('#ha-widget-droptarget-' + viewmodel.getWidgetIdFromElementId(this.id))
            // Slight hack: size based off first child, instead of the <span>,
            // as the span doesn't match the actual size.
            .offset($(this).children().offset())
            .width($(this).children().outerWidth())
            .height($(this).children().outerHeight())
            ;
        });
    }

    // Initial setup, called once at page load.
    function initPage(inParentNode, inViewmodel) {
        parentNode = inParentNode;
        viewmodel = inViewmodel;

        // Drag n drop handlers for the trashcan.
        $('.trashcan', parentNode)
        .on('dragenter', function () { $(this).addClass('drag-over'); })
        .on('dragleave', function () { $(this).removeClass('drag-over'); })
        .on('dragover', onTrashcanDragover)
        .on('drop', onTrashcanDrop);
    }

    // Widget setup, called each time the preview is updated.
    function initWidgets() {
        var previewParent = $('#widget-preview', parentNode);
        var widgets = $('.ha-widget-container', previewParent);

        // Make widgets draggable.
        widgets
        .on('dragstart', onWidgetDragstart)
        .on('dragend', onWidgetDragend)
        .children().attr('draggable', 'true');

        // Create drop targets (dropping on the actual elements is pretty broken in HTML, apparently).
        widgets.each(function () {
            $('<div class="drop-target">')
            .appendTo(previewParent)
            .attr('id', 'ha-widget-droptarget-' + viewmodel.getWidgetIdFromElementId(this.id))
            .on('dragenter', onWidgetDragenter)
            .on('dragleave', onWidgetDragleave)
            .on('dragover', onWidgetDragover)
            .on('drop', onWidgetDrop)
            ;
        });
    }

    // Can the currently dragged widget be dropped on the given element?
    function canDropOnWidget(element) {
        var targetWidget = viewmodel.getWidgetFromElementId(element.id);
        return draggedWidget && draggedWidget !== targetWidget && targetWidget.canHaveChildren;
    }

    // Event handlers.

    // Called when a widget drag is initiated.
    function onWidgetDragstart(event) {
        // Clear any selection.
        viewmodel.selected.controller = null;

        // Add drag-in-progress class to parent, so other elements can react to it.
        parentNode.addClass('drag-inprogress');

        // Add class to dragged element
        $(this).addClass('dragged');

        event.originalEvent.dataTransfer.effectAllowed = 'move';
        event.originalEvent.dataTransfer.setData('text', 'widget-drag');

        draggedWidget = viewmodel.getWidgetFromElementId(this.id);

        // Defer resize to next frame or Chrome breaks.
        setTimeout(resizeDropTargets, 0);

        // Don't propagate to parents.
        event.stopPropagation();
    }

    // Called when the entire drag operation ends.
    var onWidgetDragend = util.preventDefaultEvent(function (event) {
        // Remove classes.
        parentNode.removeClass('drag-inprogress');
        $(this).removeClass('dragged');
        $('.drag-over').removeClass('drag-over');

        draggedWidget = null;
    });

    // Called when a something is dragged over a widget (drop-target).
    function onWidgetDragover(event) {
        if (canDropOnWidget(this)) {
            // Prevent default, allowing drop.
            event.preventDefault();
        }
    }

    // Called when a widget is dropped on another widget (drop-target).
    function onWidgetDrop(event) {
        // Move the widget to the target widget.
        viewmodel.moveWidget(draggedWidget, viewmodel.getWidgetFromElementId(this.id));
        event.preventDefault();
    }

    // Called when something enters a drop-target.
    function onWidgetDragenter() {
        if (canDropOnWidget(this)) {
            // Add class to highlight the target.
            $('#ha-widget-' + viewmodel.getWidgetIdFromElementId(this.id)).addClass('drag-over');
        }
    }
    // Called when something leaves a drop-target.
    function onWidgetDragleave() {
        if (canDropOnWidget(this)) {
            // Remove class again.
            $('#ha-widget-' + viewmodel.getWidgetIdFromElementId(this.id)).removeClass('drag-over');
        }
    }

    // Called when dragging something over the trashcan.
    function onTrashcanDragover(event) {
        if (draggedWidget) {
            // Prevent default, allowing drop.
            event.preventDefault();
        }
    }

    // Called when a widget is dropped on the trashcan.
    function onTrashcanDrop(event) {
        if (draggedWidget) {
            event.preventDefault();
            event.stopPropagation();

            // Defer deletion until the next tick so the drag end events fire properly.
            var toDelete = draggedWidget;
            util.nextTick(function () { viewmodel.deleteWidget(toDelete); });
        }
    }

    return {
        initPage: initPage,
        initWidgets: initWidgets,
    };

});
