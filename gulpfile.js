let preprocessor = 'scss';

const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');
// const gcmq = require('gulp-group-css-media-queries');
const plumber       = require('gulp-plumber');
const sourcemaps    = require('gulp-sourcemaps');
const gutil         = require('gulp-util');

function browsersync() {
	browserSync.init({
		server: { baseDir: './' },
		notify: false,
	})
}

function scripts() {
	return src([
		'node_modules/jquery/dist/jquery.min.js',
		'js/scripts.js',
	])
		.pipe(sourcemaps.init())
	.pipe(plumber())
		.pipe(concat('common.min.js'))
		.pipe(uglify())
		.pipe(dest('js'))
		.pipe(sourcemaps.write('source-maps'))
		.pipe(browserSync.stream())
}

function styles() {
	return src('scss/**/*')
		.pipe(plumber(function (error) {
		gutil.log(gutil.colors.bold.red(error.message));
		gutil.beep();
		this.emit('end');
	}))
		.pipe(sass())
		.pipe(concat('main.min.css'))
		.pipe(autoprefixer({ overrideBrowserslist: ['last 2 versions'], grid: true }))
		.pipe(cleancss({ level: { 1: { specialComments: 0 } }/* , format: 'beautify' */ }))
		.pipe(dest('css'))
		.pipe(browserSync.stream())
}

function images() {
	return src('images/**/*')
		.pipe(newer('images'))
		.pipe(imagemin())
		.pipe(dest('images'))
}

function cleanimg() {
	return del('images/**/*', { force: true })
}

function buildcopy() {
	return src([
		'css/**/*.min.css',
		'js/**/*.min.js',
		'images/**/*',
		'fonts/**/*',
		'**/*.html',
	], { base: './' })
		// .pipe(gcmq())
		.pipe(dest('dist'))
}

function cleandist() {
	return del('dist/**/*', { force: true })
}

function startwatch() {
	watch(['**/*.js', '!**/*.min.js'], scripts);
	watch('scss/**/*', styles);
	watch('*.html').on('change', browserSync.reload);
	watch('images/**/*', images);

}

exports.browsersync = browsersync;
exports.scripts = scripts;
exports.styles = styles;
exports.images = images;
exports.cleanimg = cleanimg;

exports.build = series(cleandist, styles, scripts, images, buildcopy);

exports.default = parallel(styles, scripts, browsersync, startwatch);