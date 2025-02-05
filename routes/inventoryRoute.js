// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const classValidate = require("../utilities/classification-validation")
const invValidate = require("../utilities/inventory-validation")

// Public routes - no login required
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildVehicleById))

// Protected routes - require login
router.get("/", utilities.checkLogin, utilities.handleErrors(invController.buildManagement));

router.get("/add-classification", utilities.checkLogin, utilities.handleErrors(invController.buildAddClassification));
router.post(
    "/add-classification",
    utilities.checkLogin, // Added protection
    classValidate.classificationRules(),
    classValidate.checkClassData,
    utilities.handleErrors(async (req, res) => {
        const result = await invController.addClassification(req, res);
        if (result) {
            res.redirect("/inv/management");
        }
    })
);

router.get("/delete-classification", utilities.checkLogin, utilities.handleErrors(invController.buildDeleteClassification));
router.post("/delete-classification", utilities.checkLogin, utilities.handleErrors(invController.deleteClassification));

router.get("/add-inventory", utilities.checkLogin, utilities.handleErrors(invController.buildAddInventory))
router.post(
    "/add-inventory",
    utilities.checkLogin, // Added protection
    invValidate.inventoryRules(),
    invValidate.checkInvData,
    utilities.handleErrors(async (req, res) => {
        const result = await invController.addInventory(req, res);
        if (result) {
            res.redirect("/inv/management");
        }
    })
);

router.get("/management", utilities.checkLogin, utilities.handleErrors(invController.buildManagement));
router.get("/getInventory/:classification_id", utilities.checkLogin, utilities.handleErrors(invController.getInventoryJSON));

// Edit inventory
 router.get("/edit/:inv_id", 
    utilities.checkLogin,
    utilities.handleErrors(invController.editInventoryView)
  );

  // 🔹 Added route to process the inventory update
router.post(
    "/update/",
    utilities.checkLogin, // Ensure only logged-in users can update inventory
    invValidate.inventoryRules(), // Validate the input data
    invValidate.checkUpdateData, // Process validation and return errors if needed
    utilities.handleErrors(invController.updateInventory) // Call the controller function
);


module.exports = router