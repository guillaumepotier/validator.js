module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-npm2bower-sync');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            dist: ['./dist']
        },

        replace: {
            dist: {
                options: {
                    patterns: [{
                        match: 'name',
                        replacement: '<%= pkg.name %>'
                    },
                    {
                        match: 'author',
                        replacement: '<%= pkg.author.name %> - <<%= pkg.author.email %>>'
                    },
                    {
                        match: 'version',
                        replacement: '<%= pkg.version %>'
                    },
                    {
                        match: 'timestamp',
                        replacement: '<%= grunt.template.today() %>'
                    },
                    {
                        match: 'license',
                        replacement: '<%= pkg.license %>'
                    }]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['src/validator.js', 'src/extras.js'],
                    dest: 'dist/'
                }]
            }
        },

        uglify: {
            options: {
                report: 'gzip',
                preserveComments: 'some'
            },
            min: {
                files: {
                    'dist/validator.min.js': 'dist/validator.js',
                    'dist/extras.js': 'dist/extras.js'
                }
            }
        },

        sync: {
            all: {
                options: {
                    sync: ['author', 'name', 'version', 'license', 'keywords'],
                    from: 'package.json',
                    to: 'bower.json'
                }
            }
        }
    });

    grunt.registerTask('default', []);
    grunt.registerTask('build', ['clean:dist', 'replace', 'uglify', 'sync']);
};
