var express = require('express');
var router = express.Router();
var fs = require("fs");
var path = require('path');
var _ = require('underscore');
var forever = require('forever-monitor');

/* GET home page. */
appBase = path.join(__dirname,"../../")

var getDirs = function(parentDir){
	parentDir = parentDir || 'apps/';
	var dirPath = path.join(appBase, parentDir);
	var dirs = fs.readdirSync(dirPath);
	dirs = _.map(dirs,function(dir){
		var appPath = path.join(dirPath,dir);
		return {module:dir,path:appPath};
	});
	return dirs;
};
var runApps = function(dirs){
	return _.map(dirs,function(dir,idx){
		var port = 8100+idx;
		var module = dir.module;
		var app = {module:module,port:port};
		try {
			var binPath = path.join(appBase,"sys/bin/www");
			// console.log(appBase,"sys/bin/www",binPath);
			var env = {
				APP:module,
				PORT:port
			};
			app.child = forever.start(binPath,{
				max:1,
				env:env,
				watch:true,
				watchDirectory:dir.path
			});
			app.isWatching = true;
			app.child.on("watch:restart",function(info){
				console.log(module,"watch:restart",info);
			});
			app.status = "success";
			console.log("started child",env);
		}catch (e){
			app.status = "error";
			app.error = e.toString();
			console.log("error loading app:",module,port,e)
		}
		return app;
	});
};
var appInfos = function(apps){
	var attrs = ["module","port","status","error","isWatching"];
	var infos = _.map(apps,function(app){ return _.pick(app,attrs);});
	return infos;
};

apps = runApps(getDirs());
router.get('/apps/', function(req, res) {
	var infos = appInfos(apps);
	_.each(infos,function(item){
		item.url = "http://"+req.host+":"+item.port+"/";
	});
	res.json(infos);
});
router.get('/', function(req, res) {
	// res.json(appInfos(apps));
	res.render('index');
});

module.exports = router;
