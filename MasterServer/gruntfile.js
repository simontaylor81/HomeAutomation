// Grunt task runner.

module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        handlebars: {
            options: {
                namespace: 'Handlebars.templates',
                // Strip extension from name.
                processName: function(path) { return path.substr(0, path.lastIndexOf('.')); }
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
