exports.convert = convert;

var fs = require('fs');
var path = require('path');
var pug = require('pug');
var glob = require('glob');
var chokidar = require('chokidar');

function convert(logger, projectDir, options) {
    var processPugFiles = function(successCallback, errorCallback) {
        var pugOptions = {
            filename: filePath, 
            pretty: true,
        };
		var pugFilesPath = path.join(projectDir, 'app/**/*.pug');
		var pugFiles = glob.sync(pugFilesPath).filter(function(fileName){
			return fileName.indexOf("App_Resources") === -1;
		});
	
        pugFiles.forEach(function(filePath) {
			var htmlContent = null;
			
			try {
				htmlContent = pug.renderFile(filePath, pugOptions);
			} catch(e) {
                errorCallback(e);
			}
			
			if (htmlContent) {
				var htmlFilePath = filePath.replace('.pug', '.html');
				fs.writeFile(htmlFilePath, htmlContent, 'utf8');
                successCallback(htmlFilePath);
			} else{
                errorCallback(
                    new Error('Pug cannot generate output for file ' + filePath)
                );
			}	
		});
    };
	return new Promise(function (resolve, reject) {
		options = options || {};
        processPugFiles(
            function(filePath) {
                resolve('Updated ' + filePath);
            },
            function(error) {
				reject(error);
            }
        );

        if (options.watch) {
            chokidar.watch('app', {
                persistent: true,
                ignoreInitial: true,
                followSymlinks: false,
                ignored: /(^|[\/\\])\../,
            }).on('add', function() {
                processPugFiles(
                    function(filePath) {
                        console.log('Added' + filePath);
                    },
                    function(error) {
                        reject(error);
                    }
                );
            }).on('change', function() {
                processPugFiles(
                    function(filePath) {
                        console.log('Updated ' + filePath);
                    },
                    function(error) {
                        reject(error);
                    }
                );
            });
        }
	});
}
