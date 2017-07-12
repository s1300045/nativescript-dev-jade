var converter = require('./converter');

module.exports = function ($logger, $projectData, $usbLiveSyncService) {
	if (
        $usbLiveSyncService.isInitialized || 
        $projectData.$options.bundle
    ) {
		return;
	}

	return converter.convert($logger, $projectData.projectDir);
}
