'use strict';

var gulp = require('gulp'),
   gutil = require('gulp-util'),
  jshint = require('gulp-jshint'),
   mocha = require('gulp-mocha');

gulp.task('jshint', function() {
  return gulp.src('*.js')
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'));
});


gulp.task('mocha', function() {
  return gulp.src('test.js', {read: false})
    .pipe(mocha({reporter: 'mocha-spec-reporter-async', timeout: 120000}));
});

gulp.task('test', ['jshint', 'mocha'], function() {
  gulp.watch('*.js', ['jshint', 'mocha']);
});

gulp.task('help', function() {
  gutil.log('Gulp Tasks:');
  gutil.log('jshint - Run jshint');
  gutil.log('test   - Continuously test the plugin');
});

gulp.task('default', ['help']);