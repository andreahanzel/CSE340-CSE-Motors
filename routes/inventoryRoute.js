// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const classValidate = require("../utilities/classification-validation")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route for specific vehicle detail view
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildVehicleById))

// Route for inventory management view
router.get("/", utilities.handleErrors(invController.buildManagement));

// Route to add a new classification
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));
// Update existing routes to redirect success cases to management
router.post(
    "/add-classification",
    classValidate.classificationRules(),
    classValidate.checkClassData,
    utilities.handleErrors(async (req, res) => {
        const result = await invController.addClassification(req, res);
        if (result) {
            res.redirect("/inv/management");
        }
    })
);

// Route to delete a classification
router.get("/delete-classification", utilities.handleErrors(invController.buildDeleteClassification));
router.post("/delete-classification", utilities.handleErrors(invController.deleteClassification));


// Route to add new inventory item
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory))
router.post(
    "/add-inventory",
    invValidate.inventoryRules(),
    invValidate.checkInvData,
    utilities.handleErrors(async (req, res) => {
        const result = await invController.addInventory(req, res);
        if (result) {
            res.redirect("/inv/management");
        }
    })
);

// Management view route
router.get("/management", utilities.handleErrors(invController.buildManagement));

module.exports = router