var express = require('express');
var router = express.Router();
var User = require('../models/user');
var mid = require('../middleware');


router.get('/', function(req, res, next) {
    res.render('index');
});

router.get('/permissions', function(req, res, next) {
    res.render('permissions');
});

router.get('/login', mid.loggedOut, function(req, res, next) {
    return res.render('login', {title: 'Log In'});
});


router.post('/login', function(req, res, next) {
    if(req.body.email && req.body.password) {
        User.authenticate(req.body.email, req.body.password, function(error, user) {
            if(error || !user) {
                var err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            } else {
                req.session.userId = user._id;
                return res.redirect('/profile');
            }
        });
    } else {
        var err = new Error('All fields required');
        err.status = 401;
        console.log(err);
        return next(err);
    }
});

router.get('/logout', function(req, res, next) {
    if(req.session) {
        req.session.destroy(function(err) {
            if(err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

router.get('/register', mid.loggedOut, function(req, res, next) {
    res.render('register');
});

router.post('/register', function(req, res, next) {
    if(req.body.name && req.body.email && req.body.password && req.body.favoriteBook && req.body.confirmPassword) {
        //confirm that everything was entered
        if(req.body.confirmPassword !== req.body.password) {
            var err = new Error("Passwords don't match.");
            err.status = 400;
            console.log(err);
            return next(err);
        } 

        //create object with form input
        var userData = {
            email: req.body.email,
            name: req.body.name,
            favoriteBook: req.body.favoriteBook,
            password: req.body.password
        }

        //use the schema's create method to insert document into Mongo DB
        User.create(userData, function(error, user) {
            if(error) {
                return next(error);
            } else {
                req.session.userId = user._id;
                return res.redirect('/profile');
            }
        });

    } else {
        var err = new Error("All fields required.");
        console.log(err);
        err.status = 400;
        return next(err);
    }
});

// GET /profile
router.get('/profile', function(req, res, next) {
    if (! req.session.userId ) {
      var err = new Error("You are not authorized to view this page.");
      err.status = 403;
      return next(err);
    }
    User.findById(req.session.userId)
        .exec(function (error, user) {
          if (error) {
            return next(error);
          } else {
            return res.render('profile', { title: 'Profile', name: user.name, favorite: user.favoriteBook });
          }
        });
  });

  router.get('/contact', function(req, res, next) {
    return res.render('contact');
  });

  router.get('/about', function(req, res, next) {
    return res.render('about');
  });

module.exports = router;