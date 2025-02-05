const utilities = require(".");
const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model");

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
      .normalizeEmail() // refer to validator documentation
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExist = await accountModel.checkExistingEmail(account_email);
        if (emailExist) {
          throw new Error("Email is already in use. Please login or use a different email.");
        }
      }),

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
  
/* ******************************************
 * Login Data Validation Rules
 ****************************************** */
validate.loginRules = () => {
  return [
      // valid email is required
      body("account_email")
          .trim()
          .isEmail()
          .normalizeEmail() // refer to validator.js docs
          .withMessage("A valid email is required."),

      // password is required and must be strong password
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
  ]
}

/* ******************************************
* Check data and return errors or continue to login
****************************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/login", {
          errors,
          title: "Login",
          nav,
          account_email,
      })
      return
  }
  next()
}

/* ******************************************
 *  Update Account Data Validation Rules
 ****************************************** */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .isString()
      .isLength({ min: 1 })
      .withMessage("Please provide a valid first name."),

    body("account_lastname")
      .trim()
      .isString()
      .isLength({ min: 1 })
      .withMessage("Please provide a valid last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const existingAccount = await accountModel.getAccountByEmail(account_email);
        if (existingAccount && existingAccount.account_id != req.body.account_id) {
          throw new Error("Email is already in use. Please use a different one.");
        }
      }),
  ];
};

/* ******************************************
 * Password Update Validation Rules
 ****************************************** */
validate.passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements.")
  ];
};


/* ******************************************
 * Check password data and return errors or continue
 ****************************************** */
validate.checkPasswordData = async (req, res, next) => {
  const { account_password } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
      errors,
      title: "Update Account",
      nav,
      accountData: res.locals.accountData
    });
    return;
  }
  next();
};


/* ******************************************
 * Check update data and return errors or continue
 ****************************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
      errors,
      title: "Update Account",
      nav,
      accountData: { ...res.locals.accountData, account_firstname, account_lastname, account_email }
    });
    return;
  }
  next();
};



module.exports = validate;
