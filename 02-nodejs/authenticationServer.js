 /**
  You need to create a HTTP server in Node.js which will handle the logic of an authentication server.
  - Don't need to use any database to store the data.

  - Save the users and their signup/login data in an array in a variable
  - You can store the passwords in plain text (as is) in the variable for now

  The expected API endpoints are defined below,
  1. POST /signup - User Signup
    Description: Allows users to create an account. This should be stored in an array on the server, and a unique id should be generated for every new user that is added.
    Request Body: JSON object with username, password, firstName and lastName fields.
    Response: 201 Created if successful, or 400 Bad Request if the username already exists.
    Example: POST http://localhost:3000/signup

  2. POST /login - User Login
    Description: Gets user back their details like firstname, lastname and id
    Request Body: JSON object with username and password fields.
    Response: 200 OK with an authentication token in JSON format if successful, or 401 Unauthorized if the credentials are invalid.
    Example: POST http://localhost:3000/login

  3. GET /data - Fetch all user's names and ids from the server (Protected route)
    Description: Gets details of all users like firstname, lastname and id in an array format. Returned object should have a key called users which contains the list of all users with their email/firstname/lastname.
    The users username and password should be fetched from the headers and checked before the array is returned
    Response: 200 OK with the protected data in JSON format if the username and password in headers are valid, or 401 Unauthorized if the username and password are missing or invalid.
    Example: GET http://localhost:3000/data

  - For any other route not defined in the server return 404

  Testing the server - run `npm run test-authenticationServer` command in terminal
 */
// write your logic here, DONT WRITE app.listen(3000) when you're running tests, the tests will automatically start the server
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken"); // auithentication and token generation library
const SECRETKEY = require('crypto').randomBytes(64).toString('hex'); // this creates a 64 character encryption key that is hexadecimally decoded.
const PORT = 3000;
const app = express();

/* -------------- Structure of User object -----------------
{
  'username':{
    'password':password,
    'prop-1':value1,
    'prop-2':value2,
    ...
  }
}
 */
var USERS = [];
var IDCTR = 1;

// app handler and middleware functions
app.use(bodyParser.json());
function isAuthenticated(req,res,next){
  /*
  This middleware function validates the user based on username and password
  */
  let {email,password} = req.headers;
  if (email === undefined && password === undefined){
    email = req.body.email;
    password = req.body.password;
  }
  let ind = USERS.findIndex(user => {return email in user});
  if (ind !== -1 && USERS[ind][email]['password'] === password){
    req.user = USERS[ind];
    next();
  }
  else res.status(401).send("Unauthorized");
}

function signup(req,res){
  let {email,password,firstName,lastName} = req.body;
  let ind = USERS.findIndex(user => {return email in user});
  if (ind === -1){
    let user = {};
    user[email] = {
      'password':password,
      'firstName':firstName,
      'lastName':lastName,
      'id':IDCTR
    };
    IDCTR++;
    USERS.push(user);
    // console.log(USERS);
    res.status(201).send(`Signup successful`);
  }
  else res.status(400).send(`400 Bad Request! The username: ${email} already exists`);
}

function login(req,res){
  let email = Object.keys(req.user)[0]
  let userObj = {
    'email': email,
    'firstName': req.user[email].firstName,
    'lastName': req.user[email].lastName,
    'authToken': req.user[email].id
  };
  res.status(200).send(userObj);
}

function getUsers(req,res){
  let output = {'users' : USERS.map(user => {
    let email = Object.keys(user)[0]
    return {'email':email,'firstName':user[email].firstName,'lastName':user[email].lastName};
  })};
  res.status(200).json(output);
}

// app routes
app.post("/signup", signup);
app.post("/login", isAuthenticated, login);
app.get("/data", isAuthenticated ,getUsers);

// Handling Invalid Routes middleware.
app.use((req, res, next) => {
  res.status(404).send("Route not found")
})

// checking if the HTTP server is working on the given port or not
// app.listen(PORT, () => {
//   console.log(`Example app listening on port ${PORT}`)
// });
module.exports = app;
