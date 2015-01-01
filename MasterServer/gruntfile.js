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
        requirejs: {
            compile: {
                options: {
                    baseUrl: "public",
                    mainConfigFile: "public/main.js",
                    dir: "public-opt",
                    optimize: "uglify2",
                    modules: [
                        {
                            name: "main",
                            include: ["handlebars",
                                      "views/renderwidgets",
                                      "text",
                                      "devices/devices"]
                        },
                        {
                            name: "views/default",
                            exclude: ["main"]
                        },
                        {
                            name: "views/customise",
                            exclude: ["main"]
                        },
                        {
                            name: "views/login",
                            exclude: ["main"]
                        },
                        {
                            name: "views/createaccount",
                            exclude: ["main"]
                        }
                    ]
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
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    // Run watch by default.
    grunt.registerTask('default', ['watch']);

    // Prep for development or production environment.
    grunt.registerTask('dev', ['bower', 'handlebars', 'copy']);
    grunt.registerTask('prod', ['bower', 'handlebars', 'copy', 'requirejs']);
};
