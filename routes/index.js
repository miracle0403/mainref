var express = require('express');
var passport = require('passport')
var router = express.Router();

var expressValidator = require('express-validator');

var bcrypt = require('bcrypt');
const saltRounds = 15;

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.user)
  console.log(req.isAuthenticated())
  res.render('index', { title: 'SWIFT CIRCLE' });
});

//register get request
router.get('/register', function(req, res, next) {
  res.render('register', { title: 'REGISTRATION' });
});

//get login
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'LOG IN' });
});

//get logout
router.get('/logout', function(req, res, next) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

//get profile
router.get('/profile', authentificationMiddleware(), function(req, res, next) {
  res.render('profile', { title: 'USER PPROFILE' });
});

//post register
router.post('/register', function(req, res, next) {
  console.log(req.body)
  req.checkBody('sponsor', 'Sponsor must not be empty').notEmpty();
  req.checkBody('sponsor', 'Sponsor must be between 8 to 25 characters').len(8,25);
  req.checkBody('username', 'Username must be between 8 to 25 characters').len(8,25);
  req.checkBody('pass1', 'Password must be between 8 to 25 characters').len(8,100);
  req.checkBody('pass2', 'Password confirmation must be between 8 to 100 characters').len(8,100);
  req.checkBody('email', 'Email must be between 8 to 25 characters').len(8,25);
  req.checkBody('email', 'Invalid Email').isEmail();
  req.checkBody('pass1', 'Password must match').equals(req.body.pass2);
  //req.checkBody('pass1', 'Password must have upper case, lower case, symbol, and number').matches(/^(?=,*\d)(?=, *[a-z])(?=, *[A-Z])(?!, [^a-zA-Z0-9]).{8,}$/, "i")
 
  var errors = req.validationErrors();

  if (errors) {
    console.log(JSON.stringify(errors));
    res.render('register', { title: 'REGISTRATION FAILED', errors: errors});
    //return noreg
  }
  else {
    var username = req.body.username
    var password = req.body.pass1
    var cpass = req.body.pass2
    var email = req.body.email
    var sponsor = req.body.sponsor

  /**var noreg = function(reg){
    reg == false
  }*/
 
    var db = require('../db.js');
    bcrypt.hash(password, saltRounds, function(err, hash){
      db.query('INSERT INTO test (username, email, sponsor, password, status) VALUES (?, ?, ?, ?, ?)', [username, email, sponsor, hash, 0], function(error, result, fields){
        if (error) throw error;
        else{
          db.query('SELECT LAST_INSERT_ID() as user_id', function(error, results, fields){
            if (error) throw error;
  
            var user_id = results[0];
            console.log(results[0])
            req.login(user_id, function(err){
              res.redirect('profile')
              console.log('Registration was a success')
            });
          });
        }
        
      });
    });
  }
});
//Passport login
passport.serializeUser(function(user_id, done){
  done(null, user_id)
});
        
passport.deserializeUser(function(user_id, done){
  done(null, user_id)
});

//authentication middleware snippet
function authentificationMiddleware(){
  return (req, res, next) => {
    console.log(JSON.stringify(req.session.passport));
  if (req.isAuthenticated()) return next();

  res.redirect('/login'); 
  } 
}
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  successRedirect: '/profile'
}));
module.exports = router;