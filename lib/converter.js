exports.convert = convert;

var fs = require('fs');
var path = require('path');
var pug = require('pug');
var glob = require('glob');

function convert(logger, projectDir, options) {
	return new Promise(function (resolve, reject) {
		options = options || {};
		
		var pugFilesPath = path.join(projectDir, 'app/**/*.pug');
		var pugFiles = glob.sync(pugFilesPath).filter(function(fileName){
			return fileName.indexOf("App_Resources") === -1;
		});
	
		for(var i = 0; i < pugFiles.length; i++) {
		    var filePath = pugFiles[i];
			
			var htmlContent;
			
			try {
				htmlContent = pug.renderFile(filePath, { filename: filePath, pretty: true });
			} catch(e) {
				reject(Error(filePath + ' Pug failed. Error: ' + e));
			}
			
			if(htmlContent){
				var htmlFilePath = filePath.replace('.pug', '.html');
				fs.writeFile(htmlFilePath, htmlContent, 'utf8');
			} else{
				reject(Error('Pug cannot generate output for file ' + filePath));
			}	
		}
		
		resolve();
	});
}
