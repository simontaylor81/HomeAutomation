// Grunt task runner.

module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        handlebars: {
            options: {
                amd: true,          // wrap in amd/requirejs module
                namespace: false,   // no template -- just return the function as the amd module
            },
            compile: {
                files: [
                    {
                        expand: true,
                        cwd: 'views/',
                        src: ['**/*.hbs'],
                        dest: 'public/views/',
                        ext: '.js'
                    }
                ]
            }
        },
        watch: {
            files: ['views/**/*.hbs'],
            tasks: ['handlebars']
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Run watch by default.
    grunt.registerTask('default', ['watch']);
};
