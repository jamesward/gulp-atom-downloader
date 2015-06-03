'use strict';

var assert = require('chai').assert,
  tmp = require('tmp'),
  fs = require('fs'),
  atomExePath = require('./plugin');

describe('gulp-atom-downloader', function() {
  it('should download Atom for the current mac', function(done) {

    var tmpDir = tmp.dirSync({unsafeCleanup: true});
    tmpDir.removeCallback();

    var config = {
      atomDir: tmpDir.name,
      binDir: tmpDir.name + '/bin',
      platform: 'mac'
    };

    atomExePath(config).then(function(atomExePath) {
      assert.equal(atomExePath, tmpDir.name + '/bin/Atom.app'); // todo: only mac right now
      assert.isTrue(fs.existsSync(atomExePath));
      done();
    }).catch(function(err){
      done(err);
    });

  });
});