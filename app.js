const express = require('express');
const session = require('express-session');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const parseurl = require('parseurl');
const path = require('path');
const app = express();

var users = [
  {'username':'Carlota', 'password': 'codegirl'},
  {'username': 'OBenone', 'password': 'starwars'},
  {'username': 'Clifford', 'password': 'bigreddog'}
];

var userSession = ''

// Configure mustache
app.engine('mustache', mustacheExpress());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');

// Configure Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure express-session middleware
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: false,
    saveUninitialized: true
}));

// Authentication and Authorization Middleware
app.use(function(req,res, next){
  var pathname = parseurl(req).pathname;

  //if not logged in, redirect to the login page
  if(!req.session.user && pathname != '/login'){
    res.redirect('/login');
  } else {
    next();
  }
});

//count home page visits, look at views object and assign to views var
app.use(function(req, res, next){
  let views = req.session.views;
  if(!views){
    views = req.session.views = {};
  }
  //count page hits
  let pathname = parseurl(req).pathname;
  views.pathname = (views.pathname || 0) + 1;
  next();
});

// Login endpoint
app.get('/login', function (req, res) {
  res.render('login', {});
});

app.get('/', function(req,res){
  let context = {
    user: req.session.user.name,
    views: req.session.views.pathname
  };
  res.render('index', context);
});

app.get('/signup', function (req, res){
  return res.render('signup')
});

// process login form post, capture form values, store in variables
app.post('/login', function(req, res) {
  let username = req.body.username, password = req.body.password;

  //compare values against list of objects
  let siteUser = users.find(function(user){
    return user.username === username;
  });

  if(siteUser && siteUser.password === password){
    req.session.user = siteUser;
  }

  if (req.session.user){
    res.redirect('/');
  } else if (siteUser && siteUser.password !== password) {
    invalidPassword = 'Incorrect password!'
    return res.redirect('/login');
    }
    return res.redirect('signup');
});

// Logout endpoint
app.post('/logout', function (req, res) {
  delete req.session.user;
  res.redirect('/logout');
});

app.post('/create', function(req, res){
  return res.redirect('/signup')
});

app.post('/signup', function(req, res){
  userSession = req.session
  userSession = req.body.username
  userSession = req.body.password

  let newUser = {username: userSession.username, password: userSession.password}
  users.push(newUser);
  return res.redirect('/')
});

app.listen(3000, function() {
  console.log('Login page started on port 3000...');
});
