// View that allows the user to customise their widgets.
define(['lib/page', 'text!views/customise.html', './renderwidgets'], function (page, html, renderwidgets) {

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
                pageContent.html(html);

                // Render initial widgets and add to page.
                var widgets = renderwidgets(data);
                $('#widget-preview', pageContent).html(widgets.html);
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
        exit: function () {}
    };
});
