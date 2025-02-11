const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 * Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = utilities.handleErrors(async function (req, res, next) {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    });
});

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error("No data returned"))
    }
}

/* ***************************
 * Build vehicle detail view
 * ************************** */
invCont.buildVehicleById = async function (req, res, next) {
    try {
        const inventory_id = req.params.inventoryId;
        console.log("Requested Inventory ID:", inventory_id);

        // Fetch vehicle data
        const vehicleData = await invModel.getVehicleById(inventory_id);
        console.log("Fetched Vehicle Data:", vehicleData);

        // Handle missing data
        if (!vehicleData || vehicleData.length === 0) {
            const error = new Error("Vehicle not found");
            error.status = 404;
            throw error;
        }

        // Extract data
        const vehicle = vehicleData[0];
        const vehicleDisplay = `<img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}" />`;
        const nav = await utilities.getNav();
        const vehicleName = `${vehicle.inv_make} ${vehicle.inv_model}`;
        const price = vehicle.inv_price
            ? `$${parseInt(vehicle.inv_price).toLocaleString("en-US")}`
            : "Price not available";

        // Render the detail view
        res.render("./inventory/detail", {
            title: vehicleName,
            nav,
            vehicleDisplay,
            year: vehicle.inv_year || "Unknown Year",
            price,
            mileage: vehicle.inv_miles
                ? `${parseInt(vehicle.inv_miles).toLocaleString()} miles`
                : "Mileage not available",
            description: vehicle.inv_description || "No description available.",
        });
    } catch (error) {
        console.error("Controller Error:", error.message);
        next(error);
    }
};

/* ***************************
 * Build management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
    const classifications = await invModel.getClassifications()
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList() // Get classification list for dropdown
    res.render("./inventory/management", {
        title: "Vehicle Management",
        nav,
        classifications: classifications.rows,
        classificationSelect, // Added this to pass the select list to the view
        errors: null,
    })
};

/* ***************************
 * Deliver add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
    });
}

/* ***************************
 * Process Add Classification
 * ************************** */
invCont.addClassification = async function (req, res) {
    const { classification_name } = req.body;
    
    const classResult = await invModel.addClassification(classification_name);
    
    if (classResult) {
        req.flash(
            "notice",
            `The ${classification_name} classification was successfully added.`
        );
        return res.redirect("/inv/management");
    } else {
        req.flash("notice", "Sorry, adding the classification failed.");
        let nav = await utilities.getNav();
        return res.status(501).render("inventory/add-classification", {
            title: "Add New Classification",
            nav,
            errors: null,
        });
    }
}


/* ***************************
 * Process Delete Classification
 * ************************** */
invCont.buildDeleteClassification = async function (req, res, next) {
    const classifications = await invModel.getClassifications()
    let nav = await utilities.getNav()
    res.render("./inventory/delete-classification", {
        title: "Delete Classification",
        nav,
        errors: null,
        classifications: classifications.rows
    })
}

invCont.deleteClassification = async function (req, res) {
    const { classification_id } = req.body
    const deleteResult = await invModel.deleteClassification(classification_id)
    
    if (deleteResult) {
        req.flash("notice", "Classification was successfully deleted")
        return res.redirect("/inv/management");
    } else {
        req.flash("notice", "Delete failed - classification may have inventory items")
        let nav = await utilities.getNav()
        return res.status(501).render("inventory/delete-classification", {
            title: "Delete Classification",
            nav,
            errors: null,
            classifications: (await invModel.getClassifications()).rows
        })
    }
}

/* ***************************
 * Deliver add inventory view
 * ************************** */

invCont.buildAddInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    let classList = await utilities.buildClassificationList()
    res.render("./inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationSelect: classList,
        errors: null,
    })
}

invCont.addInventory = async function (req, res) {
    const { 
        classification_id, inv_make, inv_model, inv_year,
        inv_description, inv_image, inv_thumbnail,
        inv_price, inv_miles, inv_color 
    } = req.body

    const invResult = await invModel.addInventory({
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color
    })

    if (invResult) {
        req.flash("notice", `The ${inv_make} ${inv_model} was successfully added.`)
        return res.redirect("/inv/management");
    } else {
        req.flash("notice", "Sorry, adding the vehicle failed.")
        let nav = await utilities.getNav()
        return res.status(501).render("inventory/add-inventory", {
            title: "Add New Vehicle",
            nav,
            classificationSelect: await utilities.buildClassificationList(classification_id),
            errors: null,
            classification_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color
        })
    }
}


/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id)
    let nav = await utilities.getNav()
    const itemData = await invModel.getInventoryById(inv_id)
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    })
  }

  /* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
    let nav = await utilities.getNav();
    const {
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
    } = req.body;

    const updateResult = await invModel.updateInventory(
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id
    );

    if (updateResult) {
        const itemName = `${inv_make} ${inv_model}`;
        req.flash("notice", `The ${itemName} was successfully updated.`);
        res.redirect("/inv/");
    } else {
        const classificationSelect = await utilities.buildClassificationList(classification_id);
        const itemName = `${inv_make} ${inv_model}`;
        req.flash("notice", "Sorry, the update failed.");
        res.status(501).render("inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationSelect: classificationSelect,
            errors: null,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id,
        });
    }
}

/* ***************************
 *  Deliver Delete Confirmation View
 * ************************** */
invCont.confirmDeleteView = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    const itemData = await invModel.getInventoryById(inv_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/delete-confirm", {
        title: "Delete " + itemName,
        nav,
        errors: null,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_price: itemData.inv_price
    });
}

/* ***************************
 *  Process Delete Inventory Item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
    let nav = await utilities.getNav();
    const inv_id = parseInt(req.body.inv_id);

    const deleteResult = await invModel.deleteInventoryItem(inv_id); // Call model function

    if (deleteResult.rowCount) {
        req.flash("notice", "The inventory item was successfully deleted.");
        res.redirect("/inv/management"); // Redirect to management page
    } else {
        req.flash("notice", "Sorry, the delete failed.");
        res.redirect(`/inv/delete/${inv_id}`); // Reload delete confirmation view
    }
}

/* ***************************
 * Serve Delete Confirmation Page ✅
 * ************************** */
invCont.confirmDeleteClassification = async function (req, res, next) {
    try {
        const classification_id = parseInt(req.query.classification_id); // Get ID from URL query

        // Fetch classification details
        const classifications = await invModel.getClassifications();
        const classification = classifications.rows.find(c => c.classification_id === classification_id);

        if (!classification) {
            req.flash("notice", "Classification not found.");
            return res.redirect("/inv/management");
        }

        let nav = await utilities.getNav();
        res.render("inventory/delete-classification-confirm", { 
            title: "Confirm Deletion", 
            nav, 
            classification 
        });

    } catch (error) {
        console.error("Error serving delete confirmation:", error);
        req.flash("notice", "Error loading delete confirmation page.");
        res.redirect("/inv/management");
    }
};




module.exports = invCont; // Export the controller functions
