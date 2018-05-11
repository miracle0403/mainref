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
router.get('/member/register', function(req, res, next) {
  res.render('register', { title: 'REGISTRATION' });
});

router.get('/member/register/:username', function(req, res, next) {
  const db = require('../db.js');
  var username = req.params.username;

  db.query('SELECT username FROM test WHERE username = ?', [username],
   function(err, results, fields){
    if (err) throw err;

    if (results.length === 0){
      res.render('register')
      console.log('not a valid sponsor name');
    }else{
      var sponsor = results
      console.log(sponsor)
      if (sponsor){
        console.log(JSON.stringify(sponsor));
        res.render('register', { title: 'REGISTRATION', sponsor: sponsor });
      }     
    }
  });  
});

//get login
router.get('/member/login', function(req, res, next) {
  res.render('login', { title: 'LOG IN' });
});

//Get dashboard
router.get('/member/dashboard', function(req, res, next) {
  res.render('dashboard', { title: 'DASHBOARD' });
});

//Get joinmatrix
router.get('/member/joinmatrix', function(req, res, next) {
  res.render('joinmatrix', { title: 'JOIN THE BEST MATRIX' });
});

//Get PROVIDE SERVICES
router.get('/member/provideservice', function(req, res, next) {
  res.render('provideservice', { title: 'GET HIRED!' });
});

//Get dashboard
router.get('/member/requestservice', function(req, res, next) {
  res.render('requestservice', { title: 'GET YOUR JOB DONE' });
});

//get logout
router.get('/member/logout', function(req, res, next) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

//get profile
router.get('/member/profile', authentificationMiddleware(), function(req, res, next) {
  
  var db = require('../db.js');
  var currentUser = req.session.passport.user.user_id;

  //get sponsor name fromdatabase to profile page
  db.query('SELECT sponsor FROM test WHERE user_id = ?', [currentUser], function(err, results, fields){
    if (err) throw err;

    var sponsor = results;
    if (sponsor){
      res.render('profile', {title: 'PROFILE', sponsor: results});
    }
  });
});

//post register
router.post('/member/register', function(req, res, next) {
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
    res.render('/member/register', { title: 'REGISTRATION FAILED', errors: errors});
    //return noreg
  }
  else {
    var username = req.body.username
    var password = req.body.pass1
    var cpass = req.body.pass2
    var email = req.body.email
    var sponsor = req.body.sponsor
 
    var db = require('../db.js');
    db.query('SELECT username FROM test WHERE username = ?', [sponsor], function(err, results, fields){
      if (err) throw err;

      if (results.length === 0){
        console.log('not a valid sponsor name');
      }
      else{
        var spon = results;
        console.log(spon);
        bcrypt.hash(password, saltRounds, function(err, hash){
          db.query('INSERT INTO test (username, email, sponsor, password, status) VALUES (?, ?, ?, ?, ?)', [username, email, sponsor, hash, 0], function(error, result, fields){
            if (error) throw error;
            else{
              db.query('SELECT LAST_INSERT_ID() as user_id', function(error, results, fields){
                if (error) throw error;
                var user_id = results[0];
                console.log(results[0])
                req.login(user_id, function(err){
                  res.render('member/profile')
                  console.log('Registration was a success')
                });
              });
            } 
              
          });
        });
      }
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


//post login
router.post('/member/login', passport.authenticate('local', {
  failureRedirect: '/member/login',
  successRedirect: '/member/profile'
}));

//post profile
router.post('/member/profile', function(req, res, next) {
  console.log(req.body)
  //req.checkBody('account_number', 'Account Number must be between 10 numbers only').len(10);
  req.checkBody('email', 'Email must be between 8 to 25 characters').len(8,25);
  req.checkBody('email', 'Invalid Email').isEmail();
  req.checkBody('bank_name', 'Bank Name must be between 8 to 25 characters').len(8,25);
  req.checkBody('account_name', 'Account Name must be between 8 to 25 characters').len(8,25);
  //req.checkBody('pass1', 'Password must have upper case, lower case, symbol, and number').matches(/^(?=,*\d)(?=, *[a-z])(?=, *[A-Z])(?!, [^a-zA-Z0-9]).{8,}$/, "i")
 
  var errors = req.validationErrors();
 
  if (errors) {
    console.log(JSON.stringify(errors));
    res.render('profile', { title: 'UPDATE FAILED', errors: errors});
    
  }
  else {
    var phone = req.body.phone
    var bank = req.body.bank_name
    var accountNumber = req.body.account_number
    var accountName = req.body.account_name
    var email = req.body.email
     
    var db = require('../db.js');
    var user = req.isAuthenticated();
    
    db.query('UPDATE test SET ?, ?, ?, ?, ? [phone, email, bank, accountNumber, accountName], WHERE user_id = ?', [user], function(error, result, fields){
      if (error) throw error;

      console.log('profile edited');
      res.render('profile', {title: 'PROFILE EDITED!'} )
    });
  }
});
module.exports = router;