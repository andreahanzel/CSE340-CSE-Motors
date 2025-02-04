/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const path = require("path")
const app = express();
const static = require("./routes/static");
const expressLayouts = require("express-ejs-layouts");
const baseController = require("./controllers/baseController"); //Import the baseController
const inventoryRoute = require("./routes/inventoryRoute"); // Import the inventoryRoute file
const utilities = require("./utilities/");
const errorRoute = require("./routes/errorRoute"); // Import the errorRoute file
const bodyParser = require("body-parser");
const messages = require("express-messages");
const accountRoute = require("./routes/accountRoute");
const cookieParser = require("cookie-parser");


const session = require("express-session");
const pool = require("./database/"); // Matches the actual database connection file
const pgSession = require("connect-pg-simple")(session); // Added connect-pg-simple for session storage
const flash = require("connect-flash");


/* ***********************
 * Middleware Express Session
 * ************************/
app.use(session({
  store: new pgSession({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}));

/* ***********************
 * Flash Message Middleware
 * ************************/
app.use(flash())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
});



/* ***********************
  * Body Parser Middleware
  ************************/
  app.use(bodyParser.json()); // Parse JSON bodies
  app.use(bodyParser.urlencoded({ extended: true })); //for parse application/ x-www-form-urlencoded


/* ***********************
  * Login Activity Middleware
  ************************/
  app.use(cookieParser())

  /* ***********************
  * Login Process Activity Middleware
  ************************/
app.use(utilities.checkJWTToken)

/* **********************************
 * View Engine and Templates
 *********************************** */
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Serve Static Files
 *************************/
app.use(express.static(path.join(__dirname, "public"), (req, res, next) => {
  console.log(`Serving static file: ${req.url}`);
  next();
}));


/* ***********************
 * Routes
 *************************/
// Updated the Index route to use the baseController method
app.get("/", utilities.handleErrors(baseController.buildHome))// Call the buildHome method
app.use(static);

// Inventory routes
app.use("/inv", inventoryRoute); // Use the inventoryRoute for "/inv" routes

// Account routes
app.use("/account", accountRoute); // Use the already required accountRoute


// Use the errorRoute for "/error" routes
app.use("/error", errorRoute); // Use the errorRoute for "/error" routes

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, _next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
});


/* ***********************
 * File Not Found Route - must be last route in list
 *************************/
app.use(async (_req, res, _next) => {
  let nav = await utilities.getNav();   // Added await here
  res.status(404).render("errors/error", {
    title: '404 Error',
    message: 'Sorry, we appear to have lost that page.',
    nav
  });
});

/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT || 5501; // Use Render's PORT or fallback to 5501
const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost"; // Use 0.0.0.0 for Render, localhost for local testing

console.log("Environment Variables:", process.env); // Log environment variables
app.listen(port, host, (err) => {
  // If there is an error, log it and exit
  if (err) {
    console.error(`Error occurred: ${err.message}`);
    process.exit(1); // Exit with code 1 on server error
  } else {
    console.log(`Server running at http://${host}:${port}/`);
  }
});


// End of app.listen
