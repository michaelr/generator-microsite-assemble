var express = require('express'),
    fs = require('fs');

var app = express();
app.use(express.bodyParser());
app.use(express.basicAuth('cms', 'eyeeye'));
app.use(app.router);

function serveFile(filename, res) {
    fs.exists(filename, function (exists) {
        if(exists) {
            res.sendfile(filename);
        }
        else {
            res.send(404);
        }
    });
}

app.get(/^\/cms-static\/(.+)$/, function(req, res) {
    var filename = 'cms/static/' + req.params[0];
    serveFile(filename, res);
});


app.get(/^(.+)$/, function(req, res) {
    var filename = 'build/' + req.params[0];
    serveFile(filename, res);
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
