var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

var serverPath = __dirname.split('\\').slice(0,-1).join('\\');
var configFilePath = path.join(serverPath,'\\config\\tsChat.json');

/* GET configuration listing. */

router.get('/', function(req, res, next) {
    res.sendFile(path.join(serverPath,'\\views\\chatConfig.html'));
});

router.get('/getConfig', function(req, res, next) {
    let chatConfig = fs.readFileSync(configFilePath);
    res.send(chatConfig);
});

router.post('/setConfig',  function(req, res, next) {
    fs.writeFileSync(configFilePath, JSON.stringify(req.body));
    res.end();
});

module.exports = router;