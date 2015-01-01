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
        bower: {
            install: {
                options: {
                    targetDir: "public/lib",
                    layout: "byComponent",
                    cleanTargetDir: false
                }
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
    grunt.loadNpmTasks("grunt-bower-task");

    // Run watch by default.
    grunt.registerTask('default', ['watch']);
};
