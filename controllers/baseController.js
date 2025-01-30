const utilities = require("../utilities/");
const baseController = {};

/* Build Home view with MVC */

baseController.buildHome = async function(req, res) {
const nav = await utilities.getNav();  // Temporarily comment this line out if want to test the error page
req.flash("notice", "This is a flash message!"); // Debugging line
console.log("Generated Navigation:", nav); // Debugging line
res.render("index", { title: "Home", nav });
};


module.exports = baseController;
