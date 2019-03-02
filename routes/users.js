var express = require('express');
var router = express.Router();

//TODO: delete file if not needed
router.get('/:userId', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
