'use strict';

var assert = require('chai').assert,
  tmp = require('tmp'),
  fs = require('fs'),
  atomExePath = require('./plugin');

describe('gulp-atom-downloader', function() {

  var tmpDir;
  var config;

  beforeEach(function(){
    tmpDir = tmp.dirSync({unsafeCleanup: true});
    tmpDir.removeCallback();

    config = {
      atomDir: tmpDir.name,
      binDir: tmpDir.name + '/bin'
    };
  });

  afterEach(function() {
    require('rimraf').sync(config.atomDir);
  });

  it('should download Atom for mac', function(done) {

    config.platform = 'mac';

    atomExePath(config).then(function(atomPaths) {
      var expectedAtomPath = config.binDir + '/Atom.app/Contents/Resources/app/atom.sh';
      assert.equal(atomPaths.atom, expectedAtomPath);
      assert.isTrue(fs.existsSync(expectedAtomPath), expectedAtomPath + " was not found");

      var expectedApmPath = config.binDir + '/Atom.app/Contents/Resources/app/apm/bin/apm';
      assert.equal(atomPaths.apm, expectedApmPath);
      assert.isTrue(fs.existsSync(expectedApmPath), expectedApmPath + " was not found");
      done();
    }).catch(function(err){
      done(err);
    });

  });

  it('should download Atom for windows', function(done) {

    config.platform = 'win32';

    atomExePath(config).then(function(atomPaths) {
      var expectedAtomPath = config.binDir + '/Atom/atom.exe';
      assert.equal(atomPaths.atom, expectedAtomPath);
      assert.isTrue(fs.existsSync(expectedAtomPath), expectedAtomPath + " was not found");

      var expectedApmPath = config.binDir + '/Atom/resources/app/apm/bin/apm.cmd';
      assert.equal(atomPaths.apm, expectedApmPath);
      assert.isTrue(fs.existsSync(expectedApmPath), expectedApmPath + " was not found");
      done();
    }).catch(function(err){
      done(err);
    });

  });
});