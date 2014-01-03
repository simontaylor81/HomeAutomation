﻿// Script for login page.
define(['lib/page', 'text!views/login.html'], function (page, html) {
    return function (pageContent) {
        // Set page content to the loaded html.
        pageContent.html(html);

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
    };
});