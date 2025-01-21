/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const env = require("dotenv").config();
const path = require("path")
const app = express();
const static = require("./routes/static");
const expressLayouts = require("express-ejs-layouts");
const baseController = require("./controllers/baseController"); // Added this line to import the baseController
const inventoryRoute = require("./routes/inventoryRoute"); // Added this line to import the inventoryRoute file


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
app.get("/", baseController.buildHome); // Changed this line to call the buildHome method
app.use(static);

// Inventory routes
app.use("/inv", inventoryRoute); // Added this line to use the inventoryRoute for "/inv" routes

/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT || 5500; // Use Render's PORT or fallback to 5500
const host = process.env.HOST || "localhost"; // Use HOST or fallback to localhost

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`App listening on ${host}:${port}`);
});
