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
require(['lib/page'], function (page) {

    $(document).ready(function () {
        // Navbar links
        $("#id-navbar-logout").click(onClick(logout));

        $('a').filter(function () {
            var href = $(this).attr('href');
            return href.indexOf('#') === 0 && href.length > 1;
        })
        .click(onClick(function () {
            page($(this).attr('href').slice(1));
        }));

        // Allow direct links to pages.
        if (window.location.hash.length > 1) {
            page(window.location.hash.slice(1));
        }
        else {
            // Otherwise, start at the index page. Will auto-redirect to login if not already logged in.
            page('default');
        }
    });

    function onClick(handler) {
        return function (event) {
            // Don't actually follow the link.
            event.preventDefault();
            handler.call(this, event);
        }
    }

    function logout() {
        // POST logout
        $.ajax({
            type: 'POST',
            url: '/user/logout'
        })
        .always(function () {
            // Redirect to login page.
            page('login');
        });
    }
});
