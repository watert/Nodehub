var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
	res.json("changed 1");
  // res.render('index', { title: 'Express' });
});

module.exports = router;
