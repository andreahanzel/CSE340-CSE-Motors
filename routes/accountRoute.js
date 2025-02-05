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

/* ****************************************
 *  Deliver Update Account View
 * ************************************ */
router.get(
  "/update",
  utilities.checkLogin,  // ✅ Ensure user is logged in
  utilities.handleErrors(accountController.showUpdateForm)
);

/* ****************************************
 *  Process Account Update
 * ************************************ */
router.post(
  "/update",
  utilities.checkLogin,  // ✅ Ensure user is logged in
  ...regValidation.updateAccountRules(), // ✅ Corrected - Spread array
  regValidation.checkUpdateData, // ✅ Handle validation errors
  utilities.handleErrors(accountController.updateAccount)
);

/* ****************************************
 *  Process Password Update
 * ************************************ */
router.post(
  "/update-password",
  utilities.checkLogin,  // ✅ Ensure user is logged in
  regValidation.passwordRules(), // ✅ Validate new password
  regValidation.checkPasswordData, // ✅ Handle validation errors
  utilities.handleErrors(accountController.updatePassword)
);



module.exports = router;
