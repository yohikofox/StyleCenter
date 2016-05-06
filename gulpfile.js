// Sass configuration
var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var inlineFonts = require('gulp-inline-fonts');
var merge = require('gulp-merge');
var filter = require('gulp-filter');
var debug = require('gulp-debug');
var clean = require('gulp-clean');
var gulpIf = require('gulp-if');
var sprity = require('sprity');

var noPartials = function (file) {
    var path = require('path');
    var dirSeparator = path.sep.replace('\\', '\\\\');
    var relativePath = path.relative(process.cwd(), file.path);
    return !new RegExp('(^|' + dirSeparator + ')_').test(relativePath);
};

gulp.task('clear', function () {
    return gulp.src('dist', { read: false, force: true })
        .pipe(debug({ title: 'debug-clean' }))
        .pipe(clean());
});

gulp.task('inline-font', function () {
    return gulp.src(['bower_components/Font-Awesome/fonts/*'])
        .pipe(debug({ title: 'debug-inlineFontsTask' }))
        .pipe(inlineFonts({ name: 'fontawesome' }))
        .pipe(gulp.dest('dist/fonts/'));
});

gulp.task('sass', function () {
    return gulp.src(['*.scss'])//, '/**/*.scss'
        .pipe(debug({ title: 'debug-transpileSassTask' }))
        .pipe(sass({ includePaths: "/lib/**/" }))
        .pipe(sourcemaps.init())
        .pipe(filter(noPartials))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});

gulp.task('minify-css', ['inline-font', 'sass'], function () {
    return gulp.src(['dist/*.css', '!dist/*.min.css'])
        .pipe(debug({ title: 'debug-minifyCssTask' }))
        .pipe(cleanCSS())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['sass'], function () {
    gulp.watch('*.scss', ['sass']);
    gulp.watch(['dist/*.css', '!dist/*.min.css'], ['minify-css']);
    gulp.watch(['*'], ['inline-font']);
});


gulp.task('default-watch', [], function () {
    gulp.watch(['*.scss', '/lib/**/*.scss'], ['build-default']);
});

gulp.task('build-default', ['clear', 'sass', 'inline-font', 'minify-css']);

var styleguide = require('devbridge-styleguide');

gulp.task('start-styleguide', function () {
    styleguide.startServer();
});


gulp.task('sprites', function () {
    return sprity.src({
        src: './src/images/**/*.{png,jpg}',
        style:'dist/sprite.scss',
        processor:'sass'
    }).pipe(gulpIf('*.png', gulp.dest('dist/img/'), gulp.dest('dist/css/')));
});