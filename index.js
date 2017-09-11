'use strict';

var config = new (require('v-conf'))();
var exec = require('child_process').exec;
var fs = require('fs-extra');
var libNet = require('net');
var libQ = require('kew');
var net = require('net');

// Define the ControllerSqueezelite class
module.exports = ControllerSqueezelite;

function ControllerSqueezelite(context) 
{
	var self = this;

	this.context = context;
	this.commandRouter = this.context.coreCommand;
	this.logger = this.context.logger;
	this.configManager = this.context.configManager;

};

ControllerSqueezelite.prototype.onVolumioStart = function()
{
	var self = this;
	self.logger.info("Squeezelite initiated");
	
	this.configFile = this.commandRouter.pluginManager.getConfigurationFile(this.context, 'config.json');
	self.getConf(this.configFile);
	
	return libQ.resolve();	
};

ControllerSqueezelite.prototype.getConfigurationFiles = function()
{
	return ['config.json'];
};

// Plugin methods -----------------------------------------------------------------------------
ControllerSqueezelite.prototype.onStop = function() {
	var self = this;
	var defer = libQ.defer();

	self.stopService('squeezelite')
	.then(function(edefer)
	{
		defer.resolve();
	})
	.fail(function(e)
	{
		self.commandRouter.pushToastMessage('error', "Stopping failed", "Could not stop the Squeezelite plugin in a fashionable manner, error: " + e);
		defer.reject(new error());
	});

	return defer.promise;
};

ControllerSqueezelite.prototype.stop = function() {
	var self = this;
	var defer = libQ.defer();

	self.stopService('squeezelite')
	.then(function(edefer)
	{
		defer.resolve();
	})
	.fail(function(e)
	{
		self.commandRouter.pushToastMessage('error', "Stopping failed", "Could not stop the Squeezelite plugin in a fashionable manner, error: " + e);
		defer.reject(new error());
	});

	return defer.promise;
};

ControllerSqueezelite.prototype.onStart = function() {
	var self = this;
	var defer = libQ.defer();

	self.restartService('squeezelite', true)
	.then(function(edefer)
	{
		defer.resolve();
	})
	.fail(function(e)
	{
		self.commandRouter.pushToastMessage('error', "Startup failed", "Could not start the Squeezelite plugin in a fashionable manner.");
		self.logger.info("Could not start the Squeezelite plugin in a fashionable manner.");
		defer.reject(new error());
	});

	return defer.promise;
};

ControllerSqueezelite.prototype.onRestart = function() 
{
	// Do nothing
	self.logger.info("performing onRestart action");
	
	var self = this;
};

ControllerSqueezelite.prototype.onInstall = function() 
{
	self.logger.info("performing onInstall action");
	
	var self = this;
};

ControllerSqueezelite.prototype.onUninstall = function() 
{
	// Perform uninstall tasks here!
};

ControllerSqueezelite.prototype.getUIConfig = function() {
    var self = this;
	var defer = libQ.defer();    
    var lang_code = this.commandRouter.sharedVars.get('language_code');

	self.getConf(this.configFile);
	self.logger.info("Loaded the previous config.");
	
	self.commandRouter.i18nJson(__dirname+'/i18n/strings_' + lang_code + '.json',
		__dirname + '/i18n/strings_en.json',
		__dirname + '/UIConfig.json')
    .then(function(uiconf)
    {
		self.logger.info("## populating UI...");
		
		uiconf.sections[0].content[0].value = self.config.get('enabled');
		uiconf.sections[0].content[1].value = self.config.get('link_to_server');
		uiconf.sections[0].content[2].value = self.config.get('server_param');
		uiconf.sections[0].content[3].value = self.config.get('name');
		self.logger.info("1/2 Squeezelite settings sections loaded");
		
		uiconf.sections[1].content[0].value = self.config.get('output_device');
		uiconf.sections[1].content[1].value = self.config.get('alsa_params');
		uiconf.sections[1].content[2].value = self.config.get('extra_params');
		self.logger.info("2/2 Squeezelite settings sections loaded");

		self.logger.info("Populated config screen.");
		
		defer.resolve(uiconf);
	})
	.fail(function()
	{
		defer.reject(new Error());
	});

	return defer.promise;
};

ControllerSqueezelite.prototype.setUIConfig = function(data) {
	var self = this;
	
	self.logger.info("Updating UI config");
	var uiconf = fs.readJsonSync(__dirname + '/UIConfig.json');
	
	return libQ.resolve();
};

ControllerSqueezelite.prototype.getConf = function(configFile) {
	var self = this;
	this.config = new (require('v-conf'))()
	this.config.loadFile(configFile)
	
	return libQ.resolve();
};

ControllerSqueezelite.prototype.setConf = function(conf) {
	var self = this;
	return libQ.resolve();
};

// Public Methods ---------------------------------------------------------------------------------------

ControllerSqueezelite.prototype.updateSqueezeliteServerConfig = function (data)
{
	var self = this;
	var defer = libQ.defer();
	
	self.config.set('enabled', data['enabled']);
	self.config.set('link_to_server', data['link_to_server']);
	self.config.set('server_param', data['server_param']);
	self.config.set('name', data['name']);
	
	self.logger.info("Successfully updated Squeezelite server configuration");

	self.constructUnit(__dirname + "/unit/squeezelite.unit-template", __dirname + "/unit/squeezelite.service")
	.then(function(stopIfNeeded){
		if(self.config.get('enabled') != true)
		{
			self.stopService("squeezelite")
			.then(function(edefer)
			{
				defer.resolve();
			})
			.fail(function()
			{
				self.commandRouter.pushToastMessage('error', "Stopping failed", "Stopping Squeezelite failed with error: " + error);
				defer.reject(new Error());
			});
		}
	});
	
	return defer.promise;
};

ControllerSqueezelite.prototype.updateSqueezeliteAudioConfig = function (data)
{
	var self = this;
	var defer = libQ.defer();
	
	self.config.set('output_device', data['output_device']);
	self.config.set('alsa_params', data['alsa_params']);
	self.config.set('extra_params', data['extra_params']);
	
	self.logger.info("Successfully updated Squeezelite audio configuration");

	self.constructUnit(__dirname + "/unit/squeezelite.unit-template", __dirname + "/unit/squeezelite.service")
	.then(function(stopIfNeeded){
		if(self.config.get('enabled') != true)
		{
			self.stopService("squeezelite")
			.then(function(edefer)
			{
				defer.resolve();
			})
			.fail(function()
			{
				self.commandRouter.pushToastMessage('error', "Stopping failed", "Stopping Squeezelite failed with error: " + error);
				defer.reject(new Error());
			});
		}
	});
	
	return defer.promise;
};

ControllerSqueezelite.prototype.moveAndReloadService = function (unitTemplate, unitFile, serviceName)
{
	var self = this;
	var defer = libQ.defer();

	var command = "/bin/echo volumio | /usr/bin/sudo -S /bin/cp " + unitTemplate + " " + unitFile;
	
	exec(command, {uid:1000,gid:1000}, function (error, stdout, stderr) {
		if (error !== null) {
			self.commandRouter.pushConsoleMessage('The following error occurred while moving ' + serviceName + ': ' + error);
			self.commandRouter.pushToastMessage('error', "Moving service failed", "Stopping " + serviceName + " failed with error: " + error);
			defer.reject();
		}
		else {
			self.commandRouter.pushConsoleMessage(serviceName + ' moved');
			self.commandRouter.pushToastMessage('success', "Moved", "Moved " + serviceName + ".");
		}
	});
		
	command = "/bin/echo volumio | /usr/bin/sudo -S systemctl daemon-reload";
	exec(command, {uid:1000,gid:1000}, function (error, stdout, stderr) {
		if (error !== null) {
			self.commandRouter.pushConsoleMessage('The following error occurred while reloading ' + serviceName + ': ' + error);
			self.commandRouter.pushToastMessage('error', "Reloading service failed", "Reloading " + serviceName + " failed with error: " + error);
			defer.reject();
		}
		else {
			self.commandRouter.pushConsoleMessage(serviceName + ' reloaded');
			self.commandRouter.pushToastMessage('success', "Reloading", "Reloading " + serviceName + ".");
			defer.resolve();
		}
	});
			

	return defer.promise;
};

ControllerSqueezelite.prototype.restartService = function (serviceName, boot)
{
	var self = this;
	var defer = libQ.defer();

	if(self.config.get('enabled'))
	{
		var command = "/bin/echo volumio | /usr/bin/sudo -S /bin/systemctl restart " + serviceName;
		
		exec(command, {uid:1000,gid:1000}, function (error, stdout, stderr) {
			if (error !== null) {
				self.commandRouter.pushConsoleMessage('The following error occurred while starting ' + serviceName + ': ' + error);
				self.commandRouter.pushToastMessage('error', "Restart failed", "Restarting " + serviceName + " failed with error: " + error);
				defer.reject();
			}
			else {
				self.commandRouter.pushConsoleMessage(serviceName + ' started');
				if(boot == false)
					self.commandRouter.pushToastMessage('success', "Restarted " + serviceName, "Restarted " + serviceName + " for the changes to take effect.");
				
				defer.resolve();
			}
		});
	}
	else
	{
		self.logger.info("Not starting " + serviceName + "; it's not enabled.");
		defer.resolve();
	}

	return defer.promise;
};

ControllerSqueezelite.prototype.stopService = function (serviceName)
{
	var self = this;
	var defer = libQ.defer();

	var command = "/bin/echo volumio | /usr/bin/sudo -S /bin/systemctl stop " + serviceName;
	
	exec(command, {uid:1000,gid:1000}, function (error, stdout, stderr) {
		if (error !== null) {
			self.commandRouter.pushConsoleMessage('The following error occurred while stopping ' + serviceName + ': ' + error);
			self.commandRouter.pushToastMessage('error', "Stopping service failed", "Stopping " + serviceName + " failed with error: " + error);
			defer.reject();
		}
		else {
			self.commandRouter.pushConsoleMessage(serviceName + ' stopped');
			self.commandRouter.pushToastMessage('success', "Stopping", "Stopped " + serviceName + ".");
			defer.resolve();
		}
	});

	return defer.promise;
};

ControllerSqueezelite.prototype.constructUnit = function(unitTemplate, unitFile)
{
	var self = this;
	var defer = libQ.defer();
	
	var replacementDictionary = [
		{ placeholder: "${SERVER}", replacement: self.config.get('server_param') },
		{ placeholder: "${NAME}", replacement: self.config.get('name') },
		{ placeholder: "${OUTPUT_DEVICE}", replacement: self.config.get('output_device') },
		{ placeholder: "${ALSA_PARAMS}", replacement: self.config.get('alsa_params') },
		{ placeholder: "${EXTRA_PARAMS}", replacement: self.config.get('extra_params') }
	];
	
	for (var rep in replacementDictionary)
	{
		if(replacementDictionary[rep]["replacement"] === undefined)
				replacementDictionary[rep]["replacement"] = " ";
		else
		{
			if (replacementDictionary[rep]["placeholder"] == '${SERVER}' && self.config.get('server_param') != '' && self.config.get('link_to_server'))
				replacementDictionary[rep]["replacement"] = "-s " + replacementDictionary[rep]["replacement"];
			else if (replacementDictionary[rep]["placeholder"] == '${NAME}' && self.config.get('name') != '')				
				replacementDictionary[rep]["replacement"] = "-n " + replacementDictionary[rep]["replacement"];
			else if (replacementDictionary[rep]["placeholder"] == '${OUTPUT_DEVICE}}' && self.config.get('output_device') != '')
				replacementDictionary[rep]["replacement"] = "-o " + replacementDictionary[rep]["replacement"];
			else if (replacementDictionary[rep]["placeholder"] == '${ALSA_PARAMS}}' && self.config.get('alsa_params') != '')
				replacementDictionary[rep]["replacement"] = "-a " + replacementDictionary[rep]["replacement"];
		}
	}
	
	self.replaceStringsInFile(unitTemplate, unitFile, replacementDictionary)
	.then(function(activate)
	{
		self.moveAndReloadService(unitFile, '/etc/systemd/system/squeezelite.service', 'Squeezelite');
	})
	.then(function(resolve){
		self.restartService('squeezelite', false);
		defer.resolve();
	})
	.fail(function(resolve){
		defer.reject();
	});
	
	return defer.promise;
}

ControllerSqueezelite.prototype.replaceStringsInFile = function(sourceFilePath, destinationFilePath, replacements)
{
	var self = this;
	var defer = libQ.defer();
	
	fs.readFile(sourceFilePath, 'utf8', function (err, data) {
		if (err) {
			defer.reject(new Error(err));
		}
		
		var tmpConf = data;
		for (var rep in replacements)
		{
			tmpConf = tmpConf.replace(replacements[rep]["placeholder"], replacements[rep]["replacement"]);
			self.logger.info('Replacing ' + replacements[rep]["placeholder"] + " with " + replacements[rep]["replacement"]);
		}
		
		fs.writeFile(destinationFilePath, tmpConf, 'utf8', function (err) {
                if (err)
				{
					self.commandRouter.pushConsoleMessage('Could not write the script with error: ' + err);
                    defer.reject(new Error(err));
				}
                else 
				{
					self.logger.info('New unit-file created!');
					defer.resolve();
				}
        });
	});
	
	return defer.promise;
};
