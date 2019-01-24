
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
    userID: "bob",
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
    id: "archieID",
    email: "andrews@example.com",
    password: "<3veronicaLodge",
    hashedPassword: bcrypt.hashSync("<3veronicaLodge", 10),
  },
  "Bob" : {
    id: "bob",
    email: "bob@example.com",
    password: "bob",
    hashedPassword: bcrypt.hashSync("bob", 10),
  }
}

//----------------Get/Post-----------------------------
//Adding routes: the order of route definitions matters

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls",  (req, res) => {
    let templateVars = { 
      urls: urlsForUser(req.session.userId),
      user: req.session.userId,
     };
    res.render("urls_index", templateVars);
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
})


app.get("/urls/new", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    user: req.session.userId,
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
  let longURL = urlDatabase[req.params.shortURL].longURL; 
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = { 
    urls: urlsForUser(req.session.userId),
    user: req.session.userId,
   };
 res.render("urls_register", templateVars);
})

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
     res.send('Empty form');
   } else if (uniqueEmail() === false) {
     res.status(400);
     res.send('Email in use!');
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
  let templateVars = { 
    urls: urlsForUser(req.session.userId),
    user: req.session.userId,
   };
  res.render("urls_login", templateVars);
})

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let loginID = signInCheck();
  if (loginID) {
    req.session.userId = loginID;
    res.redirect('/urls');
  } else {
    res.status(403).send('Error 403: Something went wrong.');
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
  let templateVars = {
    shortURL:  req.params.id, 
    longURL: urlDatabase[req.params.id].longURL,
    user: req.session.userId,
    urls: urlsForUser(req.session.userId)
  };
  if (req.session.userId === urlDatabase[req.params.id].userID) {
    res.render("urls_show", templateVars);
  } else {
    res.status(403).send(`Error 403: You do not have access to this page.`);
  }
});

app.post("/urls/:id", (req, res) => {
  const shortUrlId = req.params.id;
  const longUrl = req.body.longURL;
  urlDatabase[shortUrlId].longURL = longUrl;
  res.redirect(`/urls`);
})

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect(`/urls`);
})


//Logout Post for _header
app.post("/logout", (req, res) => {
  req.session.userId = null; //clearcookie;
  res.redirect(`/urls`);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//--------------------Functions------------------


//generates random 6 string id
function generateRandomString() {
  return uuidv4().substr(0, 6);
}

//filterlist to see only their urls
function urlsForUser(id) {
  let filtered = {}
  for (url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      filtered[url] = urlDatabase[url];
    }
  }
  return filtered;
}