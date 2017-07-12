var fs = require('fs');
var path = require('path');
var glob = require('glob');
var Promise = require('bluebird');

// Clean-up files from compiled app packages
module.exports = function (logger, platformsData, projectData, hookArgs, $usbLiveSyncService) {
	// delete all pug files from compiled sources

	var liveSync = $usbLiveSyncService.isInitialized;

	// Don't include .pug files in LiveSync -- only sync .html files (works in {N} 3.0+)
	if (hookArgs.filesToSync !== undefined) {
		hookArgs.filesToSync.forEach(function (file, index) {
			if (file.indexOf(".pug") !== -1) {
				// Remove the .pug file from LiveSync operation
				hookArgs.filesToSync.splice(index, 1);
			}
		});
	}

	// Don't try to LiveSync .pug files (they do not exist in app package)
	if (liveSync) return;

	var platformData = platformsData.getPlatformData(hookArgs.platform.toLowerCase());

	return new Promise(function(resolve, reject) {
		// Find and remove unnecessary .pug files from iOS and Android app packages
		var pugFilesPath = path.join(platformData.appDestinationDirectoryPath, 'app/**/*.pug');
		var pugFiles = glob.sync(pugFilesPath).filter(function (filePath) {
			var path = filePath;
			var parts = path.split('/');
			var filename = parts[parts.length - 1];
			return path.indexOf("App_Resources") === -1;
		});

		Promise.each(pugFiles, function (pugFile) {
			return fs.unlinkSync(pugFile);
		})
		.then(function() {
			console.log("All .pug source files removed from app package");
			resolve();
		});
	});
}

// Utility to delete non-empty folder recursively
var deleteFolderRecursive = function(filepath) {
  if( fs.existsSync(filepath)) {
    fs.readdirSync(filepath).forEach(function(file,index){
      var curPath = path.join(filepath, file);
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    return fs.rmdirSync(filepath);
  }
};
