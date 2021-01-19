const { src, dest, watch, parallel, series } = require('gulp');
const browserSync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const rm = require('gulp-rm');
const imagemin = require('gulp-imagemin');

//clean
function clean() {
	return src('./build', { read: false })
		.pipe(rm());
}
//server
function server() {
	browserSync.init({
		server: {
			baseDir: "./build"
		},
		port: 3000,
		// open: false,
		// online: false,
		// notify: false
	});
}

//html
function html() {
	return src('./app/index.html')
		.pipe(fileinclude({ prefix: '@@' }))
		.pipe(dest('./build/'))
		.pipe(browserSync.stream());
}
//css
function css() {
	return src([
		'node_modules/normalize.css/normalize.css',
		'./app/scss/style.scss'
	])
		.pipe(sourcemaps.init())
		.pipe(sass({
			errLogToConsole: true,
			outputStyle: 'compressed'
		}).on('error', console.error.bind(console)))
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 4 versions'],
			grid: true,
			// cascade: false
		}))
		.pipe(concat('style.min.css'))
		.pipe(sourcemaps.write('/cssmaps'))
		.pipe(dest('./build/css'))
		.pipe(browserSync.stream());
}
//fonts
function font() {
	return src('./app/fonts/**/*.*')
		.pipe(dest('./build/fonts'));
}
//images
function image() {
	return src('./app/images/**/*.*')
		.pipe(imagemin())
		.pipe(dest('./build/images'));
}
//javascript
function javascript() {
	return src('./app/js/**/*.js')
		.pipe(sourcemaps.init())
		.pipe(concat('script.min.js'))
		.pipe(sourcemaps.write('/jsmaps'))
		.pipe(dest('./build/js'));
}
//watch
function watching() {
	watch('./app/*.html', html);
	watch('./app/scss/**/*.scss', css);
	watch('./app/fonts/**/*.*', font);
	watch('./app/images/**/*.*', image);
	watch('./app/js/**/*.js', javascript);
}

exports.server = server;
exports.watching = watching;
exports.javascript = javascript;
exports.image = image;
exports.font = font;
exports.css = css;
exports.html = html;
exports.clean = clean;

exports.default = series(
	clean,
	parallel(html, css, font, image, javascript),
	parallel(watching, server)
);