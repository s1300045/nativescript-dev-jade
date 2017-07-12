exports.convert = convert;

var fs = require('fs');
var path = require('path');
var pug = require('pug');
var glob = require('glob');
var chokidar = require('chokidar');

/**
 * Process .pug files
 */
var processPugFiles = function(projectDir, successCallback, errorCallback) {
    var pugFilesPath = path.join(projectDir, 'app/**/*.pug');
    var pugFiles = glob.sync(pugFilesPath).filter(function(fileName){
        return fileName.indexOf("App_Resources") === -1;
    });

    pugFiles.forEach(function(filePath) {
        var htmlContent = null;
        
        try {
            var pugOptions = {
                filename: filePath, 
                pretty: true,
            };
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

function convert(logger, projectDir, options) {
	return new Promise(function (resolve, reject) {
		options = options || {};
        processPugFiles(
            projectDir,
            function(filePath) {
                resolve('Updated ' + filePath);
            },
            function(error) {
				reject(error);
            }
        );

        if (options.watch) {
            chokidar.watch('app/**/*.pug', {
                persistent: true,
                ignoreInitial: true,
                followSymlinks: false,
                ignored: /(^|[\/\\])\../,
            }).on('add', function() {
                processPugFiles(
                    projectDir,
                    function(filePath) {
                        console.log('Added' + filePath);
                    },
                    function(error) {
                        reject(error);
                    }
                );
            }).on('change', function() {
                processPugFiles(
                    projectDir,
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
