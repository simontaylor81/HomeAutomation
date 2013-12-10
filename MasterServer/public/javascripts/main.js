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
        }
    })
    .fail(function(jqxhr, settings, exception) {
        addControl().html('ERROR getting control list: ' + exception);
    });
}

function loadControl(data, div) {
    var fullname = 'views/widgets/' + data.template;
   
    // Check if we already have the template.
    if (Handlebars.templates && Handlebars.templates[fullname]) {
        initControl(data, div);
    } else {
        // Load template.
        console.log('Getting template ' + fullname);
        $.ajax({
            url: '/' + fullname + '.js',
            cache: true,
            dataType: 'script'
        })
        .done(function(templateSource) {
            initControl(data, div);
        })
        .fail(function(jqxhr, settings, exception) {
            div.html('ERROR getting template: ' + exception);
        });
    }
}

function initControl(data, div) {
    // Run through handlebars.
    var fullname = 'views/widgets/' + data.template;
    var template = Handlebars.templates[fullname];
    var html = template(data.templateContext);
    div.html(html);

    // Run init script.
    if (controlInitFunctions[data.initFunc])
        controlInitFunctions[data.initFunc](data.params, div);
}

function addControl() {
    return $('<div>').appendTo($('#control-placeholder'));
}
