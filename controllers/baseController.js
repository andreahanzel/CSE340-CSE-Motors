const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function(req, res) {
    const nav = await utilities.getNav();  // Temporarily comment this line out if want to test the error page
    console.log("Generated Navigation:", nav); // Debugging line
    res.render("index", { title: "Home", nav });
};


module.exports = baseController;
