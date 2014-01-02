// The main view that shows the user's widgets.
// TODO: load widgets dynamically?
define(['lib/page', 'widgets/power', 'widgets/xbmc'], function (page, power, xbmc) {

    var widgets = {
        power: power,
        xbmc: xbmc
    };

    // Module object is the initalisation function.
    return function (pageContent) {

        function loadWidget(data, div) {
            var widget = widgets[data.widget];
            var templatePath = 'views/widgets/' + widget.template;
   
            // Load the template using requirejs.
            require([templatePath], function (template) {
                // Process the template.
                var html = template(data.params);
                div.html(html);

                // Run init script.
                widget.init(data.params, div);
            });
        }

        function addWidget() {
            return $('<div>').appendTo(pageContent);
        }

        // Load list of widgets.
        $.ajax({
            url: 'user/widgets',
            cache: false
        })
        .success(function (data) {
            var index;
            for (index = 0; index < data.length; index++) {
                // Create a div for the widget. Done here so order is deterministic.
                var div = addWidget();

                // Load content.
                loadWidget(data[index], div)
            }
        })
        .fail(function (jqxhr, textError, errorThrown) {
            if (jqxhr.status === 403) {
                // Redirect to the login page.
                page('login');
            } else {
                addWidget().html('ERROR getting widget list: ' + exception);
            }
        });
    }
});
