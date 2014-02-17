// Module for handling the rendering and initialisation of the different widget types.
define([
    'handlebars',
    './widgets/groupview',
    'controllers/widgets/groupcontroller',
    './widgets/buttonview',
    'controllers/widgets/buttoncontroller',
    './widgetstemplate.js'],
function (Handlebars, groupPartial, GroupController, buttonPartial, ButtonController, widgetstemplate) {

    // Widget templates and controllers.
    var widgetTypes = {
        button: {
            template: buttonPartial,
            Controller: ButtonController
        },
        group: {
            template: groupPartial,
            Controller: GroupController
        }
    };

    // Create container element with widget attributes.
    function createWidgetContainer(id, device, innerHtml) {
        // Use span not div as div creates a block.
        var result = '<span id="ha-widget-' + id + '" class="ha-widget-container"';
        if (device)
            result += ' data-ha-device="' + device + '"';
        result += '>' + innerHtml + '</span>';
        return result;
    }

    // Template helper for rendering a widget using the appropriate partial.
    Handlebars.registerHelper('widget', function(options) {
        // Check the type is valid.
        if (widgetTypes[this.type]) {
            // Assign a new widget id.
            var id = options.data.widgetData.nextId++;

            // Augment context object with the id so the partial can access it.
            var newFrame = Handlebars.createFrame(this);
            newFrame.widgetId = id;

            // Create controller and add to the list.
            options.data.widgetData.controllers.push(new widgetTypes[this.type].Controller(this));

            // Run widget partial for this object, as defined by the type member.
            var widgetHtml = widgetTypes[this.type].template(newFrame, options);

            // Wrap in container element with identifying attributes.
            return new Handlebars.SafeString(createWidgetContainer(id, this.device, widgetHtml));
        }
        return new Handlebars.SafeString("<div>Unknown Widget</div>");
    });

    // Module is function to render widgets given the user data.
    return function (data) {
        // Pass in object to collect generated widgets.
        var options = {
            data: {
                // Must wrap in sub-object to ensure we actually modify the original not a copy.
                widgetData: {
                    nextId: 0,
                    controllers: []
                }
            }
        };

        // Render the template, collecting controllers as we go.
        html = widgetstemplate(data, options);

        return { html: html, controllers: options.data.widgetData.controllers };
    };
});
