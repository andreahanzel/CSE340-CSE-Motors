const utilities = require(".");
const { body, validationResult } = require("express-validator");

const validate = {};

/* ******************************************
 *  Registration Data Validation Rules
 ****************************************** */
validate.registrationRules = () => {
  return [
    // First name is required and must be a string
    body("account_firstname")
      .trim()
      .isString()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    // Last name is required and must be a string
    body("account_lastname")
      .trim()
      .isString()
      .isLength({ min: 1 })
      .withMessage("Please provide a last name."),

    // Email is required and must be a valid format
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    // Password is required and must be strong
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};


/* ******************************************
 *  Check data and render registration form
 ****************************************** */

validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body;
  
    let errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      });
      return;
    }
  
    next();
  };
  

module.exports = validate;
