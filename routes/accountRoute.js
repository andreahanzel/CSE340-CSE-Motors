/* **********************************
 *  Account routes
 *  Deliver login view activity
 * **********************************/
// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidation = require("../utilities/account-validation");


/* **********************************
 *  Deliver Account Management View
 * **********************************/
router.get(
  "/", 
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement));

/* **********************************
 *  Deliver Login View
 * **********************************/
router.get("/login", utilities.handleErrors(accountController.buildLogin));

/* **********************************
 *  Deliver Registration View
 * **********************************/
router.get("/register", utilities.handleErrors(accountController.buildRegister));

/* **********************************
 *  Process Registration 
 * **********************************/
router.post("/register", 
    regValidation.registrationRules(),
    regValidation.checkRegData,
    utilities.handleErrors(accountController.registerAccount));

/* ************************************************
 *    Process Login Attempt
 * ************************************************ */
router.post(
    "/login",
    regValidation.loginRules(),
    regValidation.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
  );

 /* ****************************************
 *  Logout Route - Clear JWT and Redirect
 * ************************************ */
router.get("/logout", utilities.handleErrors(accountController.accountLogout));


module.exports = router;
