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
                        cwd: 'client/views/',
                        src: ['**/*.hbs'],
                        dest: 'public/views/',
                        ext: '.js'
                    }
                ]
            }
        },
        copy: {
            // Copy client files that don't need processing to the public dir unmodified.
            client: {
                expand: true,
                cwd: 'client/',
                src: ['**/*.js', '**/*.html', '**/*.css'],
                dest: 'public/'
            },
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
            client: {
                files: ['client/**/*.js', 'client/**/*.html', 'client/**/*.css'],
                tasks: ['copy:client']
            },
            handlebars: {
                files: ['client/views/**/*.hbs'],
                tasks: ['handlebars']
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks("grunt-bower-task");
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Run watch by default.
    grunt.registerTask('default', ['watch']);
};
