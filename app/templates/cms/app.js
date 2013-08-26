var express = require('express'),
    fs = require('fs');

var app = express();
app.use(express.bodyParser());
app.use(express.basicAuth('cms', 'eyeeye'));

app.get(/^(.+)$/, function(req, res) {
    var filename = 'build/' + req.params[0];
    fs.exists(filename, function (exists) {
        if(exists) {
            res.sendfile(filename);
        }
        else {
            res.send(404);
        }
    });
});
app.post('/cms', function(req, res) {
    var fragment = req.body.fragment,
        content  = req.body.content;

    if(fragment === undefined)
        res.send(400, 'Missing \'fragment\' element in request body json doc');

    if(content === undefined)
        res.send(400, 'Missing \'content\' element in request body json doc');


    var filename = 'fragments/' + fragment;

    fs.writeFile(filename, content, function (err) {
        if(err) {
            var msg = 'Error writing to ' + filename + ": " + err;
            console.log(msg);
            res.send(400, msg);
        }
        res.send(200);
    });
});

module.exports = app;
