
module.exports = function(grunt) {
    var shell = require('shelljs'),
        path = require('path'),
        notFast = ['htmllint', 'csscover', 'csslint'];

    if(grunt.cli.tasks.filter(function (t) { return t === 'cms'; }).length ) {
      // set the fast option if we're running the cms task
      grunt.option('fast', true);
    }

    grunt.registerFastTask = function(task, taskList) {
        taskList =
          grunt.option('fast') ?
            taskList.filter(function(t) {
                return notFast.indexOf(t) === -1;
            })
            : taskList;

        grunt.registerTask(task, taskList);
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            production: {
                options: {
                    paths: ["src/less/"],
                    ieCompat: true,
                },
                files: [{
                    expand: true,
                    cwd: 'src/less/',
                    src: ['*.less', '*.css'],
                    dest: 'build/preflight/',
                    ext: '.css'
                }]
            }
        },
        csslint: {
            production: {
                options: {
                    "overqualified-elements": false,
                    "qualified-headings": false,
                    "adjoining-classes": false,
                    "box-sizing": false,
                    "box-model": false,
                    "duplicate-background-images": false,
                    "ids": false,
                    "text-indent": false,
                    "unique-headings": false
                },
                src: ['build/preflight/*.css', '!build/preflight/cssgrids-min.css']
            }
        },
        htmllint: {
            all: ['build/*.html'],
        },
        cssmin: {
            combine: {
                files: {
                    'build/site.min.css': ['bower_components/normalize-css/normalize.css', 'build/preflight/*.css']
                }
            }
        },
        open : {
            all : {
                path: 'http://localhost:9292'
            }
        },
        connect : {
            all: {
                options:{
                    port: 9292,
                    hostname: "0.0.0.0",
                    middleware: function(connect, options) {
                      return [ connect.static('build') ];
                    }
                }
            }
        },
        watch : {
            dev : {
                files: ['src/**/*', 'templates/**/*','fragments/**/*'],
                tasks: ['default'],
                options: { livereload: true },
            },
            cms : {
                tasks: ['default_cms'],
                files: ['src/**/*', 'templates/**/*','fragments/**/*'],
                cms: true
            },
        },
        clean: {
            build: ["build/", "build.tar.gz"],
            preflight: ["build/preflight"]
        },
        compress: {
            production: {
                options: {
                    archive: 'build.tar.gz'
                },
                files: [{
                    src: ['build/**'],
                    dest: '.'
                }]
            }
        },
        copy: {
            static: {
                files: [
                    {
                        expand: true,
                        cwd: 'static/',
                        src: ['**'],
                        dest: 'build/',
                    },
                    {
                        expand: true,
                        cwd: 'src/js/',
                        src: ['**'],
                        dest: 'build/',
                    }
                ]
            }
        },
        cacheBust: {
            options: {
                encoding: 'utf8',
                algorithm: 'md5',
                length: 16
            },
            assets: {
                files: [{ src: ['build/**/*.html'] }]
            }
        },
        express: {
            default_option: {},
            options: {
                port: grunt.option('port') || 9000,
                hostname: '*',
                server: path.resolve('./cms/app.js'),
            }
        },
        injectCMS: {
            cms: {
                files: [{ src: ['build/**/*.html'] }]
            }
        }

    });

    // verify normalize.css is installed because cssmin silently skips it if it's not
    grunt.registerTask("verifybower", "Make sure bower components are installed", function () {
        var file = 'bower_components/normalize-css/normalize.css';
        if(!grunt.file.exists(file)){
            console.log('Can\'t find ' + file);
            console.log('Run bower install');
            return false;
        }
        return true;
    });

    grunt.registerTask("csscover", "check CSS coverage", function () {

        var css_files = grunt.file.expand(['build/preflight/*.css', '!build/preflight/cssgrids-min.css']);
        var html_files = grunt.file.expand(['build/*.html']);

        if (css_files.length === 0) {
            grunt.log.warn("No CSS files to check coverage for.");
        }

        if (html_files.length === 0) {
            grunt.log.error("No HTML files to check coverage against.");
            return false;
        }

        grunt.log.writeln("Checking coverage for %d CSS file(s) against %d HTML file(s)", css_files.length, html_files.length);

        var args = html_files.map(function (f) { return "'" + f + "'"; }).join(" ");

        for (i = 0; i < css_files.length; ++i) {
            var css_file = css_files[i];
            var code = shell.exec("carton exec css-coverage '" + css_file + "' " + args).code;
            if (code) {
                return false;
            }
        }
    });

    grunt.registerTask("assemble_templates", "build HTML templates", function () {
        var withCMS = grunt.config.get("cms") ? " --with_cms" : "",
            code = shell.exec("carton exec bin/assemble-templates" + withCMS).code;

        if (code) {
            return false;
        }
    });

    grunt.registerTask("open_local", "open up file:/// url in browser", function () {
        var code = shell.exec("open build/new-plan.html").code;
        if (code) {
            return false;
        }
    });

    grunt.registerTask('cms', function() {
        grunt.task.run(['default_cms', 'express', 'watch:cms']);
    });

    grunt.registerTask('default_cms', function() {
        grunt.config.set('cms', true);
        grunt.task.run(['default','injectCMS']);
    });

    grunt.registerMultiTask('injectCMS', 'Inject cms js to html files', function() {
        var options = {};

        grunt.util._.extend(options, this.options());

        this.files.forEach(function(f) {
            f.src.map(function(filepath) {
                var data = grunt.file.read(filepath),
                    scriptTags = '<script src="cms-static/angular.min.js"></script><script src="cms-static/iicms.js"></script>',
                    cssTags = '<link rel="stylesheet" href="cms-static/cms.css" type="text/css" />',
                    ngAttrs = 'ng-app="iicms" ng-controller="iicmsCntrl" ';

                data = data.replace(/<\/head>/, cssTags + '</head>');
                data = data.replace(/<body /, '<body ' + ngAttrs);
                data = data.replace(/<\/body>/, scriptTags + '</body>');

                grunt.file.write(filepath, data);

            });
        });
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-html');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-cache-bust');
    grunt.loadNpmTasks('grunt-express');

    grunt.registerFastTask('css', ['less', 'csslint', 'cssmin']);
    grunt.registerFastTask('html', ['assemble_templates', 'htmllint']);
    grunt.registerFastTask('static', ['copy:static']);

    grunt.registerFastTask('default', ['clean:build', 'verifybower', 'css', 'html', 'static', 'clean:preflight']);

    grunt.registerFastTask('archive', ['default', 'cacheBust', 'compress']);
    grunt.registerFastTask('dev', ['default','connect','open','watch:dev']);
    grunt.registerFastTask('local', ['default','open_local']);

};
