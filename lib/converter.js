exports.convert = convert;
'use strict';

var fs = require('fs');
var path = require('path');
var pug = require('pug');
var glob = require('glob');
var chokidar = require('chokidar');

/**
 * Process .pug files
 */
var processPugFiles = function(logger, projectDir, successCallback, errorCallback) {
    var pugFilesPath = path.join(projectDir, 'app/**/*.pug');
    var pugFiles = glob.sync(pugFilesPath).filter(function(fileName){
        return fileName.indexOf("App_Resources") === -1;
    });
    var updatedHtmlFilePaths = [];
    var hasError = false;

    pugFiles.some(function(filePath) {
        var htmlContent = null;
        
        try {
            var pugOptions = {
                filename: filePath, 
                pretty: true,
            };
            htmlContent = pug.renderFile(filePath, pugOptions);
        } catch(e) {
            errorCallback(e);
            hasError = true;
            return true;
        }
        
        if (htmlContent) {
            var htmlFilePath = filePath.replace('.pug', '.html');
            fs.writeFile(htmlFilePath, htmlContent, 'utf8');
            logger.info('Updated:' + htmlFilePath);
            updatedHtmlFilePaths.push(htmlFilePath);
        } else{
            errorCallback(
                new Error('Pug cannot generate output for file ' + filePath)
            );
            hasError = true;
            return true;
        }	
    });
    if (!hasError) {
        successCallback(updatedHtmlFilePaths);
    }
};

var onPugFileChange = function(logger, projectDir) {
    return function() {
        return new Promise(function(resolve, reject) {
            processPugFiles(
                logger,
                projectDir,
                resolve,
                reject
            );
        });
    };
};

function convert(logger, projectDir, options) {
	return new Promise(function (resolve, reject) {
		options = options || {};
        processPugFiles(
            logger,
            projectDir,
            resolve,
            reject
        );

        if (options.watch) {
            chokidar.watch('app/**/*.pug', {
                persistent: true,
                ignoreInitial: true,
                followSymlinks: false,
                ignored: /(^|[\/\\])\../,
            })
            .on('add', onPugFileChange(projectDir))
            .on('change', onPugFileChange(projectDir));
        }
	});
}
