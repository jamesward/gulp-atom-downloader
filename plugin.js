'use strict';

var gutil = require('gulp-util'),
  Promise = require('bluebird'),
  rp = require('request-promise'),
  path = require('path'),
  fs = Promise.promisifyAll(require('fs')),
  mkdirp = Promise.promisifyAll(require('mkdirp')),
  extract = Promise.promisify(require('extract-zip'));

var PLUGIN_NAME = 'gulp-atom-downloader';

function optionDefaults(options) {

  options.private = {};

  // setup the platform
  options.platform = options.platform || process.platform;

  // setup the arch
  options.arch = options.arch || process.arch;

  // check we're on the right platform, before we go any further

  if (['mac','darwin','linux','win32'].indexOf(options.platform) < 0) {
    throw new Error('Only darwin, linux or win32 platforms are supported');
  }

  if (options.platform === 'darwin' && options.arch !== 'x64') {
    throw new Error('Only the x64 architecture is supported on the darwin platform.');
  }

  if (['x64','ia32'].indexOf(options.arch) < 0) {
    throw new Error('Only the x64 and ia32 architectures are supported on the ' + process.platform + ' platform.');
  }

  if (options.platform == 'darwin') {
    options.platform = 'mac';
  }

  // okay, let's continue

  // setup the cache directory
  options.atomDir = options.atomDir || './.atom';

  options.binDir = options.binDir || path.join(options.atomDir, 'bin');

  if (options.version) {
    gutil.log('Attempting to retrieve version ' + options.version + ' of Atom');
  } else {
    gutil.log('Retrieving latest release of Atom');
  }

  // download the releases information to retrieve the download URL
  return rp.get({
    url: 'https://api.github.com/repos/atom/atom/releases',
    headers: {
      'User-Agent': 'gulp-atom-downloader'
    }
  }).then(function(data) {
    var releases = JSON.parse(data);

    var bVersion = false,
      bRelease = false;

    if (!options.version) {
      options.version = releases[0].tag_name;
      gutil.log('Found Atom version: ' + options.version);
    }

    options.private = {};
    options.private.filename = 'atom-' + options.platform + '.zip';
    options.private.filePath = path.resolve(path.join(options.atomDir, options.private.filename));

    // loop through each release and find the correct one
    releases.forEach(function(release) {

      if (release.tag_name === options.version) {

        bVersion = true;

        // loop through each of the assets to find the correct one
        release.assets.forEach(function (asset) {

          if (asset.name === options.private.filename) {

            bRelease = true;
            options.private.downloadUrl = asset.browser_download_url;

          }

        });

      }

    });

    if (!bVersion) {
      throw new Error('The specified version could not be found.');
    }

    if (!bRelease) {
      throw new Error('The ' + options.private.filename + ' release could not be found.');
    }

    return options;
  });

}


function getAtomZip(options) {

  return mkdirp.mkdirpAsync(options.atomDir)
    .then(function() {
      return fs.statAsync(options.private.filePath).catch(function() {
        // file does not exist
        gutil.log('Fetching Atom from: ' + options.private.downloadUrl);

        var pipeAction = rp(options.private.downloadUrl)
          .pipe(fs.createWriteStream(options.private.filePath));

        return new Promise(function(resolve, reject) {
          pipeAction
            .on('finish', resolve)
            .on('error', reject);
        });
      }).then(function() {
        return options;
      });
    });

}


function appExePath(options) {

  return fs.statAsync(options.binDir).catch(function() {
    return mkdirp.mkdirpAsync(options.binDir)
      .then(function() {
        gutil.log('Unzipping Atom to: ' + options.binDir);

        return extract(options.private.filePath, {dir: options.binDir});
      });
    })
    .then(function() {
      if (options.platform == 'mac') {
        return path.join(options.binDir, 'Atom.app');
      }
      else if (options.platform == 'windows') {
        return path.join(options.binDir, 'Atom');  // todo: test
      }
      else {
        throw new Error('Could not determine the Atom executable');
      }
    });

}



module.exports = function(options) {

  options = options || {};

  return optionDefaults(options)
    // todo: immutable monadicness
    .then(function(options) {
      return getAtomZip(options);
    })
    .then(function(options) {
      return appExePath(options);
    });
};