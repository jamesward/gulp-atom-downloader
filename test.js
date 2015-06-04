'use strict';

var assert = require('chai').assert,
  tmp = require('tmp'),
  fs = require('fs'),
  atomExePath = require('./plugin');

describe('gulp-atom-downloader', function() {
  it('should download Atom for mac', function(done) {

    var tmpDir = tmp.dirSync({unsafeCleanup: true});
    tmpDir.removeCallback();

    var config = {
      atomDir: tmpDir.name,
      binDir: tmpDir.name + '/bin',
      platform: 'mac'
    };

    atomExePath(config).then(function(atomExePath) {
      var expectedPath = tmpDir.name + '/bin/Atom.app/Contents/MacOS/Atom';
      assert.equal(atomExePath, expectedPath);
      assert.isTrue(fs.existsSync(expectedPath));
      done();
    }).catch(function(err){
      done(err);
    });

  });
});