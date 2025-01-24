// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

// Route for specific vehicle detail view
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildVehicleById));

router.get("/detail/:inventoryId", (req, res) => {
    res.send(`Inventory ID received: ${req.params.inventoryId}`);
});


module.exports = router
