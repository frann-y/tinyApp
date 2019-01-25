
const bodyParser = require("body-parser");
const uuidv4 = require('uuid/v4');
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

//Use and Set
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2"],
}))


//URL Database by ID
var urlDatabase = {
  "b2xVn2": {
    userID: "userRandomID",
    shortURL:"b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
  },
  "9sm5xK": {
    userID: "Bob",
    shortURL: "9sm5xK",
    longURL: "http://www.google.com"
  }
};

//User objects. Data stored for users.
  const users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple",
      hashedPassword: bcrypt.hashSync("purple", 10),
  
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "funk",
      hashedPassword: bcrypt.hashSync("funk", 10),
    },
    "Archie" : {
      id: "Archie",
      email: "andrews@example.com",
      password: "<3veronicaLodge",
      hashedPassword: bcrypt.hashSync("<3veronicaLodge", 10),
    },
    "Bob" : {
      id: "Bob",
      email: "bob@example.com",
      password: "bob",
      hashedPassword: bcrypt.hashSync("bob", 10),
    }
  };

//----------------Get/Post-----------------------------
//Adding routes: the order of route definitions matters

app.get("/", (req, res) => {
  if (req.session.userId) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls",  (req, res) => {
  if (req.session.userId) {
    let templateVars = { 
      urls: urlsForUser(req.session.userId),
      user: users[req.session.userId],
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(403);
    res.send('<html><body>Error 403: Please <a href= "/login">Login.</a></body></html>');
  }
});

app.post("/urls", (req, res) => {
  let shortUrl = generateRandomString(); //URL part 2 assigns a random keyword 
  let longUrl = req.body.longURL;
  let userID = req.session.userId;
  let newURL = {
    "userID": userID,
    "shortURL":shortUrl,
    "longURL": longUrl,
  }
  urlDatabase[shortUrl] = newURL; //URL part 2 assigning what long url we type to the random gen num
  res.redirect(`/urls`);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    user: users[req.session.userId],
  }
  //check if user is logged in
  if (req.session.userId) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//adding a route to handle shortURL requests
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send(`Error 404: This page does not exist.`);
  } else {
    let longURL = urlDatabase[req.params.shortURL].longURL; 
    res.redirect(longURL);
  }
});

app.get("/register", (req, res) => {
  if (req.session.userId) {
    res.redirect("/urls");
  } else {
    let templateVars = { 
      urls: urlsForUser(req.session.userId),
      user: users[req.session.userId],
    };
    res.render("urls_register", templateVars);
  }
});

app.post("/register", (req, res) => {
   let userId = generateRandomString();
   let newEmail = req.body.email;
   let password = req.body.password;
   const hashedPassword = bcrypt.hashSync(password, 10); //the line of code to crypt passwords

   const newUser = {
     id: userId,
     email: newEmail,
     password: password,
     hashedPassword: hashedPassword, //setting hashed passwords in the new UserObject 
   }
 
   if (!password || !newEmail ) {
     res.status(400);
     res.send('<html><body>Error: Empty form. <a href="/register">Please try again.</a></body></html>');
   } else if (uniqueEmail() === false) {
     res.status(400);
     res.send('<html><body>Error: Email already in use. <a href="/register">Please try again.</a></body></html>');
   } else {
     users[userId] = newUser;
     req.session.userId = userId;
     res.redirect(`/urls`);
   }
 
   function uniqueEmail() {
    for (let user in users) {
      if (users[user].email === newEmail) {
        return false;
      }
    }
    return true;
   }
 });

app.get("/login", (req, res) => {
  if (req.session.userId) {
    res.redirect("/urls");
  } else {
    let templateVars = { 
      urls: urlsForUser(req.session.userId),
      user: users[req.session.userId],
    };
    res.render("urls_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let loginID = signInCheck();
  if (loginID) {
    req.session.userId = loginID;
    res.redirect('/urls');
  } else {
    res.status(403).send('<html><body>Error: Something went wrong. <a href="/login">Please try again.</a></body></html>');
  }

  function signInCheck() {
    for (let user in users) {
      if (users[user].email === email) {
        if (bcrypt.compareSync(password, users[user].hashedPassword)) { //compares password against hashed password
          return users[user].id;
        }
        return false;
      }
    }
    return false;
  }
});


app.get("/urls/:id", (req, res) => {
  if (req.session.userId && req.session.userId === urlDatabase[req.params.id].userID){
    let templateVars = {
      shortURL:  req.params.id, 
      longURL: urlDatabase[req.params.id].longURL,
      user: users[req.session.userId],
      urls: urlsForUser(req.session.userId),
    };
    res.render("urls_show", templateVars);
  } else if (!urlDatabase[req.params.id]) {
    res.status(404).send(`Error 404: This page does not exist.`);
  } else if (!req.session.userId) {
    res.status(403).send('<html><body>Error 403: Please <a href= "/login">Login.</a></body></html>');
  } else if (req.session.userId && req.session.userId !== urlDatabase[req.params.id].userID) {
    res.status(403).send('Error 403: You do not have access to this page.');
  }
});

app.post("/urls/:id", (req, res) => {
  const shortUrlId = req.params.id;
  const longUrl = req.body.longURL;
  urlDatabase[shortUrlId].longURL = longUrl;
  res.redirect(`/urls`);
});

app.post("/urls/:id/delete", (req, res) => {
  if(req.session.userId && req.session.userId === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    res.redirect(`/urls`);
  } else if (!req.session.userId) {
    res.status(403);
    res.send('<html><body>Error 403: Please <a href= "/login">Login.</a></body></html>');
  } else if (req.session.userId && req.session.userId !== urlDatabase[req.params.id].userID){
    res.status(403).send('Error 403: You do not have access to this page.');
  }
});


//Logout Post for _header
app.post("/logout", (req, res) => {
  req.session = null; //clearcookie;
  res.redirect(`/urls`);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//--------------------Functions------------------


//generates random 6 string id
function generateRandomString() {
  return uuidv4().substr(0, 6);
};

//filterlist to see only their urls
function urlsForUser(id) {
  let filtered = {}
  for (url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      filtered[url] = urlDatabase[url];
    }
  }
  return filtered;
};