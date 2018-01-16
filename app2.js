var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');
var session = require('express-session');
var app = express();

/* BELOW WE ARE GOING TO include some middleware called "connect-mongo" to be used as a 
sessions database to store scalable amounts of sessions for when 
many users are logged into our app at a time. This way we don't 
let the server RAM get bogged down and crash from too many users at once! */
var MongoStore = require('connect-mongo')(session);

//connect to mongoDB via mongoose
mongoose.connect("mongodb://localhost:27017/authApp");
var db = mongoose.connection;

//mongo error handler
db.on('error', console.error.bind(console, "Problem connecting to DB: "));

//use sessions for tracking logins
app.use(session({
    secret: 'my first auth app',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));

//make user ID available to templates
app.use(function(req, res, next) {
    res.locals.currentUser = req.session.userId;
    return next();
});

//use the bodyparser middleware to parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//serve static files from public folder
app.use(express.static(__dirname + '/public'));

//set the templating engine
app.set('views', path.join(__dirname, "views"));
app.set('view engine', "pug");

//use the correct routes in the router
var mainPage = require('./routes/main');
app.use('/', mainPage);

//catch 404 errors 
app.use(function(req, res, next) {
    var err = new Error('File not found');
    err.status = 404;
    next(err);
});

//the last app.use callback for catching last minute errors
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//listen on port
/*-----Start Port------*/
    function normalizePort(val) {
        var port = parseInt(val, 10);

        if (isNaN(port)) {
        // named pipe
        return val;
        }

        if (port >= 0) {
        // port number
        return port;
        }

        return false;
    }

    var port = normalizePort(process.env.PORT || '3000');
    app.set('port', port);

    app.listen(port, () => {
        console.log('Connected and running on port 3000!');
    });
/*-----End Port------*/