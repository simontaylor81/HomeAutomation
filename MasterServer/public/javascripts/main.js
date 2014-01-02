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

    $(document).ready(function(){
        // Start at the index page. Will auto-redirect to login if not already logged in.
        page('default');
    });
});
