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
const baseController = require("./controllers/baseController"); // Added this line to import the baseController
const inventoryRoute = require("./routes/inventoryRoute"); // Added this line to import the inventoryRoute file
const utilities = require("./utilities/");
const errorRoute = require("./routes/errorRoute"); // Added this line to import the errorRoute file

/* **********************************
 * View Engine and Templates
 *********************************** */
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Serve Static Files
 *************************/
app.use(express.static(path.join(__dirname, "public"))); 

/* ***********************
 * Routes
 *************************/
// Updated the Index route to use the baseController method
app.get("/", utilities.handleErrors(baseController.buildHome))// Changed this line to call the buildHome method
app.use(static);

// Inventory routes
app.use("/inv", inventoryRoute); // Added this line to use the inventoryRoute for "/inv" routes

// Added this line to use the errorRoute for "/error" routes
app.use("/error", errorRoute); // Added this line to use the errorRoute for "/error" routes

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
const port = process.env.PORT || 5500; // Used Render's PORT or fallback to 5500
const host = process.env.HOST || "localhost"; // Used HOST or fallback to localhost

/* ***********************
 * Log statement to confirm server operation
 *************************/
console.log("Environment Variables:", process.env); // Added this line to log environment variables
app.listen(port, host, (err) => {
  // If there is an error, log it and exit
  if (err) { 
    console.error(`Error occurred: ${err.message}`);
    process.exit(1); // Exit with code 1 on server error
  } else { 
    console.log(`Server running at http://${host}:${port}/`); 
  } 
}); // End of app.listen
