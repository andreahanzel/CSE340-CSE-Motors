const utilities = require("../utilities");
const { body, validationResult } = require("express-validator");
const validate = {};

/*  **********************************
 *  Classification Data Validation Rules
 * ********************************* */
validate.classificationRules = () => {
    return [
        // classification_name is required and must contain only letters
        body("classification_name")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a classification name.")
        .matches(/^[A-Za-z]+$/)
        .withMessage("Classification name must contain only letters."),
    ]
}

/* ******************************
 * Check data and return errors 
 * ***************************** */
validate.checkClassData = async (req, res, next) => {
    const { classification_name } = req.body;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("inventory/add-classification", {
            errors,
            title: "Add New Classification",
            nav,
            classification_name,
        });
        return;
    }
    next();
}

module.exports = validate;