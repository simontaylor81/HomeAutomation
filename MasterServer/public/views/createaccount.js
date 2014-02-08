// Script for login page.
define(['lib/page', 'text!views/createaccount.html'], function (page, html) {
    return function (pageContent) {
        // Set page content to the loaded html.
        pageContent.html(html);

        // Clear logged in state (hides logout and customise buttons).
        page.setLoggedIn(false);

        // Hook up submit event.
        $('.form-signin').submit(function (event) {
            // Don't do the regular submit, as it refreshes the page.
            event.preventDefault();

            // Ajax-post the create request.
            $.ajax({
                type: 'POST',
                url: '/user/createaccount',
                data: $(this).serialize()
            })
            .success(function (data) {
                // Account creation successful -- redirect to main page.
                page('default');
            })
            .fail(function (jqxhr, textError, errorThrown) {
                $('#createaccount-error-msg')
                    .text('Failed to create account: ' + jqxhr.responseText)
                    .removeClass('ha-hidden');
            });
        });

        // Escape arbitrary string for regex use.
        // Taken from https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
        function escapeRegExp(string) {
            return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        }

        // When the contents of the password box change, update the pattern of the confirm box to match it.
        $('input[name="password"]').change(function (event) {
            var newPattern = escapeRegExp($(this).val());
            var dest = $('input[name="passwordRpt"]');
            dest.attr('pattern', newPattern);
        });

        // Hook up login link.
        $('#createaccount-loginlink').click(function (event) {
            event.preventDefault();
            page('login');
        });
    };
});
