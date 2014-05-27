var express = require('express');
var router = express.Router();
var fs = require("fs");
var path = require('path');
var _ = require('underscore');
var forever = require('forever-monitor');

/* GET home page. */
appBase = path.join(__dirname,"../../")
var getDirs = function(){
	var dirPath = path.join(appBase, 'apps/');
	var dirs = fs.readdirSync(dirPath);
	dirs = _.map(dirs,function(dir){
		var appPath = path.join(dirPath,dir);
		return {module:dir,path:appPath};
	});
	return dirs;
};
var runApps = function(dirs){
	_.each(dirs,function(dir,idx){
		var port = 8100+idx;
		var module = dir.module;

		try {
			var binPath = path.join(appBase,"sys/bin/www");
			// console.log(appBase,"sys/bin/www",binPath);
			var env = {
				APP:module,
				PORT:port
			};
			var child = forever.start(binPath,{
				max:1,
				env:env,
				watch:true,
				watchDirectory:dir.path
			});
			child.on("watch:restart",function(info){
				console.log(module,"watch:restart",info);
			});
			console.log("started child",env);
		}catch (e){
			console.log("error loading app:",module,port,e)
		}
		console.log(dir);
	});
};

runApps(getDirs());
router.get('/', function(req, res) {
	// var dirs = getDirs();
	res.json(dirs);
  // res.render('index', { title: 'Express' });
});

module.exports = router;
