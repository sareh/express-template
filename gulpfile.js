var $        = require('gulp-load-plugins')();
var argv     = require('yargs').argv;
var browser  = require('browser-sync');
var gulp     = require('gulp');
var panini   = require('panini');
var rimraf   = require('rimraf');
var sequence = require('run-sequence');
var sherpa   = require('style-sherpa');

var scssPath       = 'public/src/assets/scss/';

var distPath       = 'public/dist/'
var cssPath        = 'public/dist/assets/css/';
var jsPath         = 'public/dist/assets/js/';
var viewsPath      = 'public/dist/assets/views/';
var foundationPath = 'public/bower_components/foundation-sites/foundation-sites-6.0.3/';


// Check for --production flag
var isProduction = !!(argv.production);
// console.log("isProduction:"+isProduction);

// Port to use for the development server.
var PORT = 8000;

// Browsers to target when prefixing CSS.
var COMPATIBILITY = ['last 2 versions', 'ie >= 9'];

// File paths to various assets are defined here.
var PATHS = {
  assets: [
    'public/src/assets/**/*',
    '!/public/src/assets/{!img,js,scss,views}/**/*',
    '!/public/index.html'
  ],
  sassfoundation: [
    'public/bower_components/motion-ui/src/',
    foundationPath + 'scss',
  ],
  javascriptfoundation: [
    'public/bower_components/jquery/dist/jquery.js',
    'public/bower_components/what-input/what-input.js',
    foundationPath + 'js/foundation.core.js',
    foundationPath + 'js/foundation.util.*.js',
    // Paths to individual JS components defined below
    foundationPath + 'js/foundation.abide.js',
    foundationPath + 'js/foundation.accordion.js',
    foundationPath + 'js/foundation.accordionMenu.js',
    foundationPath + 'js/foundation.drilldown.js',
    foundationPath + 'js/foundation.dropdown.js',
    foundationPath + 'js/foundation.dropdownMenu.js',
    foundationPath + 'js/foundation.equalizer.js',
    foundationPath + 'js/foundation.interchange.js',
    foundationPath + 'js/foundation.magellan.js',
    foundationPath + 'js/foundation.offcanvas.js',
    foundationPath + 'js/foundation.orbit.js',
    foundationPath + 'js/foundation.responsiveMenu.js',
    foundationPath + 'js/foundation.responsiveToggle.js',
    foundationPath + 'js/foundation.reveal.js',
    foundationPath + 'js/foundation.slider.js',
    foundationPath + 'js/foundation.sticky.js',
    foundationPath + 'js/foundation.tabs.js',
    foundationPath + 'js/foundation.toggler.js',
    foundationPath + 'js/foundation.tooltip.js',
    
    // 'src/assets/js/**/*.js',
    // 'src/assets/js/foundation.js'
  ],
  angularvendor: [
    'public/bower_components/angular/angular.min.js',
    'public/bower_components/angular-jwt/dist/angular-jwt.js',
    'public/bower_components/angular-resource/angular-resource.min.js',
    'public/bower_components/angular-ui-router/release/angular-ui-router.min.js',
    'public/bower_components/angular-aria/angular-aria.min.js',
  ],
  angularapp: [
    'public/src/assets/js/app.js',
    'public/src/assets/js/services/tokenService.js',
    'public/src/assets/js/services/authInterceptor.js',
    'public/src/assets/js/services/currentUser.js',
    'public/src/assets/js/models/user.js',
    'public/src/assets/js/models/chat.js',
    'public/src/assets/js/controllers/usersController.js',
    'public/src/assets/js/controllers/chatsController.js',
  ],
  views: [
    'public/src/assets/views/*.html',
  ]
};

var sassPaths      = PATHS.sassfoundation;
var sassPaths = [
  'public/bower_components/foundation-sites/foundation-sites-6.0.3/scss',
  'public/bower_components/motion-ui/src'
];

gulp.task('sass', function() {
  return gulp.src(scssPath + 'app.scss')
    .pipe($.sass({
      includePaths: sassPaths
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe(gulp.dest(cssPath));
});


// gulp.task('sass', function() {
//   return gulp.src(scssPath+'app.scss')
//     .pipe($.sass({
//       includePaths: sassPaths
//     })
//       .on('error', $.sass.logError))
//     .pipe($.autoprefixer({
//       browsers: ['last 2 versions', 'ie >= 9']
//     }))
//     .pipe(gulp.dest(cssPath));
// });

// gulp.task('default', ['sass'], function() {
//   gulp.watch([scssPath+'**/*.scss'], ['sass']);
// });


// Delete the "dist" folder
// This happens every time a build starts
gulp.task('clean', function(done) {
  rimraf(distPath, done);
});

// // Copy files out of the assets folder
// // This task skips over the "img", "js", and "scss" folders, which are parsed separately (& "views" folder)
// gulp.task('copy', function() {
//   gulp.src(PATHS.assets)
//     .pipe(gulp.dest('public/dist/assets'));
// });

// // Compile Sass into CSS
// // In production, the CSS is compressed
// gulp.task('sass', function() {
//   var uncss = $.if(isProduction, $.uncss({
//     html: ['public/src/**/*.html'],
//     ignore: [
//       new RegExp('^meta\..*'),
//       new RegExp('^\.is-.*')
//     ]
//   }));

//   var minifycss = $.if(isProduction, $.minifyCss());

//   return gulp.src('public/src/assets/scss/app.scss')
//     .pipe($.sourcemaps.init())
//     .pipe($.sass({
//       includePaths: PATHS.sassfoundation
//     })
//     .on('error', $.sass.logError))
//     .pipe($.autoprefixer({
//       browsers: COMPATIBILITY
//     }))
//     // // .pipe(uncss)
//     // // .pipe(minifycss)
//     // .pipe($.if(!isProduction, $.sourcemaps.write()))
//     .pipe(gulp.dest('public/dist/assets/css'));
// });

// Combine JavaScript into one file
// In production, the file is minified
gulp.task('javascriptfoundation', function() {
  var uglify = $.if(isProduction, $.uglify()
    .on('error', function (e) {
      console.log(e);
    }));

  return gulp.src(PATHS.javascriptfoundation)
    .pipe($.sourcemaps.init())
    .pipe($.concat('javascript-foundation-concat.js'))
    .pipe(uglify)
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(gulp.dest(jsPath));
});

// Combine Angular JavaScript into one file
// In production, the file is minified
gulp.task('angularvendor', function() {
  var uglify = $.if(isProduction, $.uglify()
    .on('error', function (e) {
      console.log(e);
    }));

  return gulp.src(PATHS.angularvendor)
    .pipe($.sourcemaps.init())
    .pipe($.concat('angular-vendor-concat.js'))
    .pipe(uglify)
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(gulp.dest(jsPath));
});

gulp.task('angularapp', function() {
  var uglify = $.if(isProduction, $.uglify()
    .on('error', function (e) {
      console.log(e);
    }));

  return gulp.src(PATHS.angularapp)
    .pipe($.sourcemaps.init())
    .pipe($.concat('angular-app-concat.js'))
    .pipe(uglify)
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(gulp.dest(jsPath));
});

// // Copy images to the "dist" folder
// // In production, the images are compressed
// gulp.task('images', function() {
//   var imagemin = $.if(isProduction, $.imagemin({
//     progressive: true
//   }));

//   return gulp.src('public/src/assets/img/**/*')
//     .pipe(imagemin)
//     .pipe(gulp.dest('public/dist/assets/img'));
// });

// // Build the "dist" folder by running all of the above tasks
// gulp.task('build', function(done) {
//   sequence('clean', ['pages', 'sass', 'javascript', 'angular', 'images', 'copy'], done);
// });

// // Start a server with LiveReload to preview the site in
// gulp.task('server', ['build'], function() {
//   browser.init({
//     server: 'public/dist', port: PORT
//   });
// });

gulp.task('views', function() {
  // copy view files into dist
  // & minify the views.
  return gulp.src(PATHS.views)
    .pipe(gulp.dest(viewsPath));
});

// gulp.task('watch', function () {
//   gulp.watch(['public/src/assets/js/**/*.js'], ['angularapp', browser.reload]);
//   gulp.watch(['public/src/assets/views/**/*.html'], ['views', browser.reload]);
// });

// gulp.task('default', ['clean', 'sass', 'javascript', 'angularvendor', 'angularapp', 'views', 'watch'], function() {
//   gulp.watch(PATHS.assets, ['copy', browser.reload]);
//   // gulp.watch(['index.html'], ['views', browser.reload]);
//   gulp.watch(['public/src/assets/views/**/*.html'], ['views', browser.reload]);
//   gulp.watch(['public/src/assets/scss/**/*.scss'], ['sass', browser.reload]);
//   gulp.watch(['public/src/assets/js/**/*.js'], ['javascript', browser.reload]);
//   gulp.watch(['public/src/assets/js/**/*.js'], ['angularvendor', browser.reload]);
//   gulp.watch(['public/src/assets/js/**/*.js'], ['angularapp', browser.reload]);
// });


gulp.task('default', ['clean', 'sass', 'javascriptfoundation', 'angularvendor', 'angularapp'], function() {
  gulp.watch([scssPath + '**/*.scss'], ['sass']);
  gulp.watch(['public/src/assets/js/**/*.js'], ['javascriptfoundation', browser.reload]);
  gulp.watch(['public/src/assets/js/**/*.js'], ['angularvendor', browser.reload]);
  gulp.watch(['public/src/assets/js/**/*.js'], ['angularapp', browser.reload]);
});
