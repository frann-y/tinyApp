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

//adding a route to handle shortURL requests
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]; //URL part 2 takes whatever parameters u have //creating a key w what person has entered
  //URL part 2: req . params gets everything after the colon. so has to be EXACT! 
  res.redirect(longURL);
  //
});

// adding a route handler for which will render it's template
//had to add long urls, object hard to understand
app.get("/urls/:id", (req, res) => {
  let templateVars = {shortURL:  req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

//assigning random keyword to added urls
app.post("/urls", (req, res) => {
  //console.log(req.body);  // debug statement to see POST parameters
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  const shortUrl = generateRandomString(); //URL part 2 assigns a random keyword 
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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//above is using express exercise. 
//i mixed javascript code with html markup

