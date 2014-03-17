// View that allows the user to customise their widgets.
define(['lib/page', 'lib/util', 'lib/databind', 'text!views/customise.html', './renderwidgets', './customise-draganddrop', './customise-viewmodel'],
function (page, util, databind, html, renderwidgets, draganddrop, ViewModel) {

    var parentNode;

    // View model, used for binding.
    var viewmodel = new ViewModel();

    // Save the widgets back to the user's account.
    viewmodel.saveFired.subscribe(function () {
        viewmodel.save.text = 'Saving...';
        viewmodel.save.inProgress = true;
        databind.updateBindings(viewmodel);

        // POST widgets to the server.
        $.ajax({
            url: 'user/widgets',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(viewmodel.widgetData),
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
            viewmodel.save.text = 'Save';
            viewmodel.save.inProgress = false;
            databind.updateBindings(viewmodel);
        });
    });

    // Defer update to next tick so we can call updatePreview multiple
    // times in succession without a performance hit.
    var updatePreview = util.deferredOperation(function () {
        var previewParent = $('#widget-preview', parentNode);

        var renderedWidgets = renderwidgets(viewmodel.widgetData);
        previewParent.html(renderedWidgets.html);
        viewmodel.widgetControllers = renderedWidgets.controllers;

        // Add click handler to each widget for selecting them.
        $('.ha-widget-container', previewParent)
        .click(util.preventDefaultEvent(function (event) {
            // Find the widget controller for the clicked on node.
            var controller = viewmodel.getWidgetFromElementId(this.id);

            viewmodel.selected.controller = controller;

            // Don't propagate up the tree -- only want to select the top-most widget.
            event.stopPropagation();
        }));

        // Re-apply selection highlight.
        setSelectionHighlight();

        // Set up drag and drop stuff.
        draganddrop.initWidgets();
    });
    viewmodel.widgetsChanged.subscribe(updatePreview);

    function setSelectionHighlight() {
        // Clear any existing selected class.
        $('.ha-widget-container', parentNode).removeClass('ha-selected-widget');

        if (viewmodel.selected.valid) {
            // Set selected class on this widget.
            $('#ha-widget-' + viewmodel.selected.controller.id, parentNode).addClass('ha-selected-widget');
        }
    }
    viewmodel.selectionChanged.subscribe(setSelectionHighlight);

    // Update binding when the viewmodel changes.
    viewmodel.dataChanged.subscribe(function () { databind.updateBindings(viewmodel); });

    function initPage() {
        // Set up data binding.
        databind.initBinding(parentNode, viewmodel);

        // Clicking somewhere not on a widget clears selection.
        parentNode.click(function () { viewmodel.selected.controller = null; });

        // But we don't want to do this for the edit pane, so prevent clicks bubbling up from there.
        $('#edit-pane').click(function (event) { event.stopPropagation(); });

        // Initialise drag and drop.
        draganddrop.initPage(parentNode, viewmodel);
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

                viewmodel.widgetData = data;

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
            databind.cleanupBinding(viewmodel);
        }
    };
});
