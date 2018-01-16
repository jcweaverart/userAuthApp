function loggedOut(req, res, next) {
    if(req.session && req.session.userId) {
        return res.redirect('/profile');
    }
    return next();
}

function loggedIn(req, res, next) {
    if(!req.session.userId) {
        return res.redirect('/permissions');
    } else {
        return next();
    }
}

module.exports.loggedIn = loggedIn;
module.exports.loggedOut = loggedOut;