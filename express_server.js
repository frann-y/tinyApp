//the body-parser library will allow us to access POST request parameters, such as req.body.longURL
//the bodyParse library will allow us to acces Post REQUEST PARAMETERS
//such as req.body.longURL which we will store in a variable called urlDatabase
//later we will store them in a real database. for now just communication between 
//server ad client
const bodyParser = require("body-parser");

const uuidv4 = require('uuid/v4');
//require should be grouped together
var express = require("express");
var app = express();
var PORT = 3001; // default port 8080
var cookieParser = require('cookie-parser') //cookie parser require

//Use and Set?
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())


//this is getting my diff routes
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//User objects. data store for users.
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "Archie" : {
    id: "archieID",
    email: "andrews@example.com",
    password: "<3veronicaLodge"
  },
  "Bob" : {
    id: "bob",
    email: "bob@example.com",
    password: "bob"
  }
}

//generates random 6 string id
function generateRandomString() {
  return uuidv4().substr(0, 6);
}


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// adding a route handler for /urls. using res.render()
    //to pass the URL data to your template 
app.get("/urls",  (req, res) => {
    let templateVars = { 
      urls: urlDatabase,
      user: req.cookies["userId"]
     };
    res.render("urls_index", templateVars);
});

//adding a route to urls_new.ejs
//the order of route definitions matters
app.get("/urls/new", (req, res) => {
  let templateVars = { 
    urls: urlDatabase,
    user: req.cookies["userId"]
  }
//check if user is logged in
//if loggedIn == render /urls/new
// else === render /login
  if (req.cookies["userId"]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});













//adding a route to handle shortURL requests
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]; //URL part 2 takes whatever parameters u have //creating a key w what person has entered
  //URL part 2: req . params gets everything after the colon. so has to be EXACT! 
  res.redirect(longURL);
  //
});

//Get for Register page
app.get("/register", (req, res) => {
  let templateVars = {
    shortURL:  req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: req.cookies["userId"],
  };
 res.render("urls_register", templateVars);
})

//Post for Register Page
app.post("/register", (req, res) => {
  //register post, fill in later
   let userId = generateRandomString();
   let newEmail = req.body.email;
   let password = req.body.password;
 
   const newUser = {
     id: userId,
     email: newEmail,
     password: password,
   }
 
 
   if (!password || !newEmail ) {
     res.status(400);
     res.send('Empty form');
   } else if (uniqueEmail() === false) {
     res.status(400);
     res.send('Email in use!');
   } else {
     users[userId] = newUser;
     res.cookie("userId", userId);  
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


//Get login Page
app.get("/login", (req, res) => {
  let templateVars = {
    shortURL:  req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: req.cookies["userId"],
  };
  res.render("urls_login", templateVars);
})


//Post login page
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let loginID = signInCheck();
  if (loginID) {
    res.cookie("userId", loginID).redirect('/urls')
  } else {
    res.status(403).send('Error 403 something went wrong :(');
  }

  function signInCheck() {
    for (let user in users) {
      if (users[user].email === email) {
        if (users[user].password === password) {
          return users[user].id;
        }
        return false;
      }
    }
    return false;
  }
});


// adding a route handler for which will render it's template
//had to add long urls, object hard to understand
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL:  req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: req.cookies["userId"],
  };
  res.render("urls_show", templateVars);
});


//assigning random keyword to added urls
app.post("/urls", (req, res) => {
  //console.log(req.body);  // debug statement to see POST parameters
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  let shortUrl = generateRandomString(); //URL part 2 assigns a random keyword 
  urlDatabase[shortUrl] = req.body.longURL; //URL part 2 assigning what long url we type to the random gen num
  res.redirect(`/urls/${shortUrl}`); //URL part 2 redirect to the page that has the short url 
})

//Post for deleting a url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]//DELETING URLS: url database //req.body gets info from form inputs req.params = retrieve from the routes
  //console.log("REQ.PARAMS === ", req.params.id); DELETING URLS: //test to see what it gets
  res.redirect(`/urls`); //redirect to indexpage //DELETING URLS: can inspect source for a lot of things
})

//Post for Updating a URl
app.post("/urls/:id", (req, res) => {
  //extract the value of the id in the url
  //req.params
  console.log(req.params);
  const shortUrlId = req.params.id;
  //extract the long url value from the form
  console.log(req.body);
  const longUrl = req.body.longURL;
  //req.body
  //update the value in the url database
  urlDatabase[shortUrlId] = longUrl;

  //name key=value
  //redirect to /urls
  res.redirect(`/urls`);
})

//Logout Post for _header
app.post("/logout", (req, res) => {
  //clearcookie
  res.clearCookie("userId");
  res.redirect(`/urls`);
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//above is using express exercise. 
//i mixed javascript code with html markup

