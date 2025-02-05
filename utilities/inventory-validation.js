const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};

validate.inventoryRules = () => {
    return [
        body("classification_id")
            .isInt()
            .withMessage("Classification is required."),
        body("inv_make")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Make is required."),
        body("inv_model")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Model is required."),
        body("inv_year")
            .isInt({ min: 1900, max: 2024 })
            .withMessage("Year must be between 1900 and 2024."),
        body("inv_description")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Description is required."),
        body("inv_price")
            .isFloat({ min: 0 })
            .withMessage("Price must be a positive number."),
        body("inv_miles")
            .isInt({ min: 0 })
            .withMessage("Miles must be a positive number."),
        body("inv_color")
            .trim()
            .isLength({ min: 1 })
            .withMessage("Color is required.")
    ]
}

validate.checkInvData = async (req, res, next) => {
    const { 
        classification_id, inv_make, inv_model, inv_year, 
        inv_description, inv_image, inv_thumbnail, 
        inv_price, inv_miles, inv_color 
    } = req.body
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/add-inventory", {
            errors,
            title: "Add New Vehicle",
            nav,
            classificationSelect: classList,
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
        return
    }
    next()
}

/* ***************************
 *  Validate and Check Update Data - 🔹 Added this function
 * ************************** */
validate.checkUpdateData = async (req, res, next) => {
    const { 
        inv_id, classification_id, inv_make, inv_model, inv_year, 
        inv_description, inv_image, inv_thumbnail, 
        inv_price, inv_miles, inv_color 
    } = req.body
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/edit-inventory", {
            errors,
            title: `Edit ${inv_make} ${inv_model}`,
            nav,
            classificationSelect: classList,
            inv_id,
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
        return
    }
    next()
}

module.exports = validate;