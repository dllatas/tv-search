// Load plugins
var gulp = require('gulp'),
    babel = require('gulp-babel'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr(),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    gutil = require('gulp-util'),
    sourcemaps = require('gulp-sourcemaps'),
    babelify = require('babelify');

// React transformation
gulp.task('jsx', function() {
    console.log("JSX transormation!!");
    return gulp.src('src/jsx/**/*.js')
        .pipe(babel({
            presets: ['react']
        }))
        .pipe(gulp.dest('src/js'));
});

gulp.task('js', ['jsx'], function() {
  return gulp.src('src/js/**/*.js')
    .pipe(babel({
            presets: ['es2015']
        }))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(livereload(server))
    .pipe(gulp.dest('dist/js'))
    .pipe(notify({ message: 'Scripts task complete' }));
});

// Browserify
gulp.task('browserify', ['js'], function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: 'dist/js/main.min.js',
    debug: true
  });

  return b.bundle()
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/'));
});

// Default task
gulp.task('default', ['browserify'], function() {
    console.log('running !!')
});