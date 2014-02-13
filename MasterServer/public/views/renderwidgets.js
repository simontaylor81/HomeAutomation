// Module for handling the rendering and initialisation of the different widget types.
define(['handlebars', './widgets/group', './widgets/button', 'widgets/power', 'widgets/xbmc', './widgetstemplate.js'],
function (Handlebars, groupPartial, buttonPartial, power, xbmc, widgetstemplate) {
    // Widget partial templates.
    var widgetPartials = {
        button: buttonPartial,
        group: groupPartial
    };

    // Simple helper for inserting common widget data attributes.
    //Handlebars.registerHelper('widgetAttributes', function() {
    //    var result = 'data-ha-widget-id="' + this.widgetId + '"';
    //    if (this.device)
    //        result += 'data-ha-device="' + this.device + '"';
    //    return new Handlebars.SafeString(result);
    //});

    // Create container element with widget attributes.
    function createWidgetContainer(id, device, innerHtml) {
        // Use span not div as div creates a block.
        var result = '<span id="ha-widget-' + id + '"';
        if (device)
            result += ' data-ha-device="' + device + '"';
        result += '>' + innerHtml + '</span>';
        return result;
    }

    // Template helper for rendering a widget using the appropriate partial.
    Handlebars.registerHelper('widget', function(options) {
        // Check the type is valid.
        if (widgetPartials[this.type]) {
            // Assign a new widget id.
            var id = options.data.widgetData.widgetCount++;

            // Augment context object with the id so the partial can access it.
            var newFrame = Handlebars.createFrame(this);
            newFrame.widgetId = id;

            // Run widget partial for this object, as defined by the type member.
            var widgetHtml = widgetPartials[this.type](newFrame, options);

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
                widgetData: { widgetCount: 0 }
            }
        };

        html = widgetstemplate(data, options);
        alert(options.data.widgetData.widgetCount + " widgets created");

        return html;
    };
});
