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
            dist1: {
                options: {
                    separator: ';\n',
                },
                src: ['src/js/dist-settings-prod.js', 'src/js/global-functions.js', 'src/js/object-defaults.js', 'src/js/rtm-controls.js', 'src/js/viz-dashlet.js', 'src/js/viz-mgd-widget.js', 'src/js/viz-query.js', 'src/js/viz-dashboard.js', 'src/js/viz-dashboard-manager.js', 'src/js/key-val-collection.js', 'src/js/dashlet-coms.js', 'src/js/id-index-array.js'],
                dest: 'dist/viz.js',
            },
            dist2: {
                options: {
                    separator: '\n',
                },
                src: ['src/css/viz-dashlet.css', 'src/css/viz-mgd-widget.css', 'src/css/viz-dashboard.css', 'src/css/key-val-collection.css'],
                dest: 'dist/viz.css',
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
                    'dist/viz.min.css': ['dist/viz.css']
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
    grunt.registerTask('default', ['concat:dist1','concat:dist2','uglify', 'copy', 'cssmin']);


};