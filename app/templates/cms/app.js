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

app.get(/^\/fe$/, function(req, res) {
    serveFile('cms/static/fe.html', res);
});

app.get(/^\/fe-status$/, function(req, res) {
    res.send({
      fragment: 'fragments/basic/4-related-info/body',
      diff: '\
@@ -3,3 +3,5 @@\
<li><a href="health-assessment.html">Health Assessment</a></li>\
<li><a href="wellness.html">Wellness</a></li>\
 </ul>\
+\
+test\
  '  });
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

    fs.writeFile(filename, content + "\n", function (err) {
        if(err) {
            var msg = 'Error writing to ' + filename + ": " + err;
            console.log(msg);
            res.send(400, msg);
        }
        res.send(200);
    });
});

module.exports = app;
