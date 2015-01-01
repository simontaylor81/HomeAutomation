// Script for login page.
define(['core/page', 'text!views/login.html'], function (page, html) {
    return {
        enter: function (pageContent) {
            // Set page content to the loaded html.
            pageContent.html(html);

            // Clear logged in state (hides logout and customise buttons).
            page.setLoggedIn(false);

            // Hook up submit event.
            $('.form-signin').submit(function (event) {
                // Don't do the regular submit, as it refreshes the page.
                event.preventDefault();

                // Ajax-post the login request.
                $.ajax({
                    type: 'POST',
                    url: '/user/login',
                    data: $(this).serialize()
                })
                .success(function (data) {
                    // Login successful -- redirect to main page.
                    page('default');
                })
                .fail(function (jqxhr, textError, errorThrown) {
                    $('#login-error-msg')
                        .text('Login failed: ' + jqxhr.responseText)
                        .removeClass('ha-hidden');
                });
            });

            // Hook up create account link.
            $('#login-createaccountlink').click(function (event) {
                event.preventDefault();
                page('createaccount');
            });
        },
        exit: function () {}
    };
});
