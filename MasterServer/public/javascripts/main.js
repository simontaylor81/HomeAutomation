// Main entry point.

// requirejs config.
requirejs.config({
    baseUrl: 'javascripts',
    paths: {
        views: '../views',
        handlebars: 'lib/handlebars.runtime-v1.1.2'
    },
    shim: {
        'handlebars': {
            exports: 'Handlebars'
        }
    }
});

// Require necessary modules.
require(['widgets/power', 'widgets/xbmc'], function (power, xbmc) {

    var widgets = {
        power: power,
        xbmc: xbmc
    };

    $(document).ready(function(){
        loadControls();
    });

    // Add a log message.
    function appendLog(str) {
        $('#log').append(str + '<br>');
    }

    function loadControls() {
        // Load list of controls.
        $.ajax({
            url: 'test/controllist.json',
            cache: true,
            success: function(data) {
                var index;
                for (index = 0; index < data.length; index++) {
                    // Create a div for the control. Done here so order is deterministic.
                    var div = addControl().attr('id', 'control' + index);

                    // Load content.
                    loadControl(data[index], div)
                }
            }
        })
        .fail(function(jqxhr, settings, exception) {
            addControl().html('ERROR getting control list: ' + exception);
        });
    }

    function loadControl(data, div) {
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

    function addControl() {
        return $('<div>').appendTo($('#control-placeholder'));
    }
});
