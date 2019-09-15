module.exports = function (grunt) {
    grunt.initConfig({

        // define source files and their destinations
        uglify: {
            files: {
                src: 'dist/viz.js',  // source files mask
                dest: 'dist/',    // destination folder
                expand: true,    // allow dynamic building
                flatten: true,   // remove all unnecessary nesting
                ext: '.min.js'   // replace .js to .min.js
            }
        },
        watch: {
            js: { files: 'src/js/*.js', tasks: ['uglify'] },
        },
        concat: {
            options: {
                separator: ';\n',
            },
            dist: {
                src: ['src/js/global-classes.js', 'src/js/rtm-controls.js', 'src/js/viz-dashlet.js', 'src/js/viz-mgd-widget.js', 'src/js/viz-query.js', 'src/js/wmservice.js', 'src/js/viz-widget-manager.js'],
                dest: 'dist/viz.js',
            }
        },
        copy: {
            main: {
                files: [
                    { expand: true, cwd: 'src/templates', src: ['**'], dest: 'dist/templates' },
                ]
            }
        },
        cssmin: {
            options: {
                mergeIntoShorthands: false,
                roundingPrecision: -1
            },
            target: {
                files: [{
                    expand: true,
                    cwd: 'src/css',
                    src: ['*.css', '!*.min.css'],
                    dest: 'dist/css',
                    ext: '.min.css'
                }]
            }
        }
    });

    // load plugins
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // register at least this one task
    grunt.registerTask('default', ['concat', 'uglify', 'copy', 'cssmin']);


};