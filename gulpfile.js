/*global require*/

var gulp = require('gulp'),
	pug = require('gulp-pug'),
	prefix = require('gulp-autoprefixer'),
	sass = require('gulp-sass'),
	browserSync = require('browser-sync'),
	pugLinter = require('gulp-pug-linter'),
	minifyCSS = require('gulp-minify-css'),
	concat = require('gulp-concat'),
	notify = require('gulp-notify'),
	plumber = require('gulp-plumber'),
	path = require('path'),
	minify = require('gulp-minify'),
	image = require('gulp-image'),
	rename = require('gulp-rename');

var paths = {
	public: './dist/',
	sass: './src/scss/',
	css: './dist/css/',
	data: './src/_data/',
	pug: './src/views/*.pug',
	js: './src/js/*.js'
};

var displayError = function (error) {
	// Initial building up of the error
	var errorString = '[' + error.plugin.error.bold + ']';
	errorString += ' ' + error.message.replace("\n", ''); // Removes new line at the end

	// If the error contains the filename or line number add it to the string
	if (error.fileName)
		errorString += ' in ' + error.fileName;

	if (error.lineNumber)
		errorString += ' on line ' + error.lineNumber.bold;

	// This will output an error like the following:
	// [gulp-sass] error message in file_name on line 1
	console.error(errorString);
};

var onError = function (err) {
	notify.onError({
		title: "Gulp",
		subtitle: "Failure!",
		message: "Error: <%= error.message %>",
		sound: "Basso"
	})(err);
	this.emit('end');
};

var sassOptions = {
	outputStyle: 'compressed'
};

var prefixerOptions = {
	browsers: ['last 2 versions']
};

/* SCSS
---------------------------------------------*/
gulp.task('sass', function () {
	return gulp.src(paths.sass + 'styles.scss')
		.pipe(sass())
		.pipe(plumber({
			errorHandler: onError
		}))
		.pipe(sass(sassOptions))
		.pipe(prefix(prefixerOptions))
		.pipe(concat('styles.css'))
		.pipe(minifyCSS())
		.pipe(rename('styles.min.css'))
		.pipe(gulp.dest(paths.css));
});


/* PUG
---------------------------------------------*/
gulp.task('pug', function () {
	return gulp.src(paths.pug)
		.pipe(pug({
			pretty: true,
		}))
		.on('error', notify.onError(function (error) {
			return 'An error occurred while compiling pug.\nLook in the console for details.\n' + error;
		}))
		.pipe(rename(function (file) {
			file.dirname = path.join(file.dirname, file.basename);
			file.basename = 'index';
		}))
		.pipe(gulp.dest(paths.public));
});

gulp.task('rebuild', ['pug', 'sass'], function () {
	browserSync.reload();
});

gulp.task('browser-sync', ['sass', 'pug'], function () {
	browserSync({
		server: {
			baseDir: paths.public
		},
		notify: false
	});
});

/* PUG LINT
---------------------------------------------*/
gulp.task('lint:template', function () {
	return gulp
		.src(paths.pug)
		.pipe(pugLinter())
		.pipe(pugLinter.reporter());
});

/* Images
---------------------------------------------*/
gulp.task('image', function () {
	gulp.src('./src/images/*')
		.pipe(image())
		.pipe(gulp.dest(paths.public + 'images'));
});

/* WATCH
---------------------------------------------*/
gulp.task('watch', function () {
	gulp.watch(paths.sass + '**/*.scss', ['sass']);
	gulp.watch('./src/views/**/*.pug', ['rebuild']);
	gulp.watch('.src/images/*', ['image']);
});

/* BUILD
---------------------------------------------*/
gulp.task('build', ['sass', 'pug', 'image']);

/* BROWSER SYNC
---------------------------------------------*/
gulp.task('default', ['build', 'browser-sync', 'watch']);
