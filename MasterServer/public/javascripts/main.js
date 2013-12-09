var controlInitFunctions = {};

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
        },
        error: function() {
            addControl().html('ERROR getting control list');
        }
    });
}

function loadControl(data, div) {
    // Load template.
    $.ajax({
        url: data.templateUrl,
        cache: true,
        success: function(templateSource) {
            // Run through handlebars.
            var template = Handlebars.compile(templateSource);
            var html = template(data.templateContext);
            div.html(html);

            // Run init script.
            if (controlInitFunctions[data.initFunc])
                controlInitFunctions[data.initFunc](data.params, div);
        },
        error: function() {
            div.html('ERROR getting template');
        }
    });
}

function addControl() {
    return $('<div>').appendTo($('#control-placeholder'));
}
