﻿// Controller that handles loading different pages in the app.
// Exports a single function, that navigates to the given page.
define(function () {

    var pageContent;
    var currentView;

    $(document).ready(function(){
        // Grab references to the appropriate place in the DOM once it's ready.
        pageContent = $('#page-content');
        if (pageContent.length === 0) {
            throw new Error("Couldn't find page-content element in DOM.");
        }
    });

    // The goto function
    function goto(newPage) {
        // DOM must be ready.
        if (!pageContent) {
            throw new Error('Cannot go to a page before the DOM is ready.');
        }

        // Notify preview page we're leaving it.
        if (currentView) {currentView.exit(); }

        // Clear any existing content.
        pageContent.html('');

        // Load the pages script.
        require(['views/' + newPage], function (view) {
            // Initialise it.
            view.enter(pageContent);
            currentView = view;
        });
    }

    // Module object is the goto function.
    var module = goto;

    // Set the logged-in state.
    module.setLoggedIn = function (loggedIn) {
        // Show/hide navbar elements based on page params.
        $('.ha-hide-loggedin').toggleClass('ha-hidden', !!loggedIn);
        $('.ha-hide-notloggedin').toggleClass('ha-hidden', !loggedIn);
    }

    return goto;
});
