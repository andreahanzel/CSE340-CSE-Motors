// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const classValidate = require("../utilities/classification-validation")
const invValidate = require("../utilities/inventory-validation")

// Public routes - no login required
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildVehicleById));
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON)); // Public

// Protected routes - require login
router.get("/", utilities.checkLogin, utilities.checkAdminOrEmployee, utilities.handleErrors(invController.buildManagement));
//router.get("/", utilities.handleErrors(invController.buildManagement));
router.get("/management", utilities.checkLogin, utilities.checkAdminOrEmployee, utilities.handleErrors(invController.buildManagement));


/* ****************************************
 * Apply checkAdminOrEmployee to Inventory Routes 
 **************************************** */
router.get("/add-classification", utilities.checkLogin, utilities.handleErrors(invController.buildAddClassification));
router.post(
    "/add-classification",
    utilities.checkLogin, 
    utilities.checkAdminOrEmployee, // | ADDED checkAdminOrEmployee
    classValidate.classificationRules(),
    classValidate.checkClassData,
    utilities.handleErrors(invController.addClassification)
);

router.get("/delete-classification", utilities.checkLogin, utilities.checkAdminOrEmployee, utilities.handleErrors(invController.buildDeleteClassification)); // | ADDED checkAdminOrEmployee
router.post("/delete-classification", utilities.checkLogin, utilities.checkAdminOrEmployee, utilities.handleErrors(invController.deleteClassification)); // | ADDED checkAdminOrEmployee

// Route to show delete confirmation page ✅
router.get("/delete-classification-confirm", utilities.checkLogin, utilities.checkAdminOrEmployee, invController.confirmDeleteClassification);

router.get("/add-inventory", utilities.checkLogin, utilities.handleErrors(invController.buildAddInventory))
router.post(
    "/add-inventory",
    utilities.checkLogin,
    utilities.checkAdminOrEmployee, // | ADDED checkAdminOrEmployee
    invValidate.inventoryRules(),
    invValidate.checkInvData,
    utilities.handleErrors(invController.addInventory)
);

// Edit inventory (should remain protected)
router.get("/edit/:inv_id", 
    utilities.checkLogin,
    utilities.checkAdminOrEmployee, // | ADDED checkAdminOrEmployee
    utilities.handleErrors(invController.editInventoryView)
);

// Route to process inventory update (should remain protected)
router.post(
    "/update/",
    utilities.checkLogin,
    utilities.checkAdminOrEmployee, // | ADDED checkAdminOrEmployee
    invValidate.inventoryRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
);

// Route to display the delete confirmation view (should remain protected)
router.get(
    "/delete/:inv_id",
    utilities.checkLogin,
    utilities.checkAdminOrEmployee, // | ADDED checkAdminOrEmployee
    utilities.handleErrors(invController.confirmDeleteView)
);

// Route to process the delete action (should remain protected)
router.post(
    "/delete/",
    utilities.checkLogin,
    utilities.checkAdminOrEmployee, // | ADDED checkAdminOrEmployee
    utilities.handleErrors(invController.deleteInventoryItem)
);


module.exports = router;
