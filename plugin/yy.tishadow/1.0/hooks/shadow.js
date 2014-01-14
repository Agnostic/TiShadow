var sys = require('sys');
var spawn = require('child_process').spawn;
var os = require('os');
var path = require('path');
var fs = require('fs');
var commands = require('../commands/shadow');

exports.cliVersion = '>=3.2.0';
exports.version = '1.0';
exports.title = 'TiShadow Express';
exports.desc  = 'For very basic and quick tishadow usage';
exports.extendedDesc = 'Requires tishadow: `[sudo] npm install -g tishadow`';

exports.init = init;
var logger;
function init(_logger, config, cli) {
  if (process.argv.indexOf('--shadow') !== -1 || process.argv.indexOf('--tishadow') !== -1) {
    cli.addHook('build.pre.compile', preCompileHook);
    logger = _logger;
  }
}
function preCompileHook(build, finished) {
  var new_project_dir = path.join(build.projectDir, 'build', 'appify');

  // get ip address 

  var ifaces=os.networkInterfaces();
  var ip_address;
  for (var dev in ifaces) {
    ifaces[dev].forEach(function(details){
      if (details.family=='IPv4' && !details.internal) {
        ip_address = details.address;
      }
    });
  }

  var args = build.cli.argv.$_
       .filter(function(el) { return el !== "--shadow" && el !== "--tishadow"})
       .concat(["--project-dir", new_project_dir]);  
  commands.startAppify(logger, new_project_dir, build.cli.argv.platform, ip_address, function() {
    commands.buildApp(logger,args)
    commands.startServer(logger);
    commands.startWatch(logger, build.cli.argv.platform, ip_address);
  });
}
