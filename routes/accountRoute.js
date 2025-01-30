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
    (req, res) => {
      res.status(200).send('login process')
    }
  );

module.exports = router;
