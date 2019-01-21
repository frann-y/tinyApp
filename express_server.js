const uuidv4 = require('uuid/v4');
//require should be grouped together
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

app.set("view engine", "ejs");

//this is getting my diff routes
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//generates random 6 string id
function generateRandomString() {
  uuidv4().substr(0, 6);
}

//the body-parser library will allow us to access POST request parameters, such as req.body.longURL
//the bodyParse library will allow us to acces Post REQUEST PARAMETERS
//such as req.body.longURL which we will store in a variable called urlDatabase
//later we will store them in a real database. for now just communication between 
//server ad client
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


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
    let templateVars = { urls: urlDatabase };
    res.render("urls_index", templateVars);
});

//adding a route to urls_new.ejs
//the order of route definitions matters
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// adding a route handler for which will render it's template
//had to add long urls, object hard to understand
app.get("/urls/:id", (req, res) => {
  let templateVars = {shortURL:  req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//above is using express exercise. 
//i mixed javascript code with html markup

