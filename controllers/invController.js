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


module.exports = invCont; // Export the controller functions
