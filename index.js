




var path = require('path');
var bodyParser = require('body-parser');
var Monitor = require('page-monitor');
var opn = require('opn');

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);



var activelyMonitoring = false;
var monitor;
var url;
var pingSite;


























//allow parsing and referencing postback data
app.use(bodyParser.urlencoded({
    extended: true
}));

//allow express to use files in the public folder
app.use(express.static('public'));

//initiate express
app.listen(3000, function () {
    console.log("express is listening on port 3000");
});

app.route('/')
    .get(function (req, res) {
        res.render(path.join(__dirname + '/public/index.ejs'));

        console.log(__dirname + '/public/index.ejs');
    });


app.route('/monitor')
    .post(function (req, res) {
        url = req.body.userInput;
        url = fixUrl(url);

        monitorSite();

        res.json(url);
    });

//when user navigates away from page
app.route('/stop')
    .get(function (req, res) {
        if (activelyMonitoring) {
            console.log("stopping interval");
            clearInterval(pingSite);
            console.log("interval stopped");
            activelyMonitoring = false;
        }
    });



function fixUrl(urlToFix){
    const prefix = "http";
    if (urlToFix.substr(0, prefix.length) !== prefix) {
        urlToFix = prefix + "://" + urlToFix;
    }

    if (!urlToFix.includes("."))
    {
        urlToFix += ".com";
    }

    return urlToFix;
}


function monitorSite() {
    monitor = new Monitor(url);
    activelyMonitoring = true;


    io.once('connection', function(socket){

        console.log("socket.io connected on server-side");

        socket.on('disconnect', function(){
            console.log("socket disconnected");
        });


        pingSite = setInterval(function () {
            monitor.capture(function (code) {
                console.log(monitor.log.info);

                //open webpage if changes are found
                if (monitor.log.info.length != 0 && activelyMonitoring) {
                    //opn(url);

                    socket.emit('site change', {url: url});
                }

                //console.log('[DONE] exit [' + code + ']');
            });
        }, 2000);

    });


    server.listen(3001, function(){
        console.log("socket.io listening on port 3001");
    });


    monitor.on('debug', function (data) {
        //console.log(data);
    });
    monitor.on('error', function (data) {
        console.error('[ERROR] ' + data);
    });











};

server.listen(3001, function(){
    console.log("socket.io listening on port 3001");
});


