/* **********************************
 *  Account Controller
 *  Deliver login view activity
 * **********************************/
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* **********************************
 *  Deliver Login View
 * **********************************/
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    });
};

/* **********************************
 *  Deliver Registration View
 * **********************************/
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    });
};

/* ************************************************
 *    Process Registration
 * ************************************************ */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
      // regular password and cost (salt is generated automatically)
      hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
      req.flash(
          "notice",
          "Sorry, there was an error processing the registration."
      )
      res.status(500).render("account/register", {
          title: "Registration",
          nav,
          errors: null,
      })
      return
  }

  const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
  )

  if (regResult) {
      req.flash("notice", 
          `Congratulations, you're registered ${account_firstname}. Please log in.`
      )
      return res.redirect("/account/login")
  } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
          title: "Registration",
          nav,
      })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
            if(process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            }
            res.locals.accountData = accountData
            res.locals.loggedin = 1
            
            // Redirect to the originally requested URL or default to account management
            const returnTo = req.session.returnTo || "/account/"
            delete req.session.returnTo
            return res.redirect(returnTo)
        }
        else {
            req.flash("notice", "Please check your credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        throw new Error('Access Forbidden')
    }
  }

/* ****************************************
 *  Deliver Account Management View
 * ************************************ */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      accountData: res.locals.accountData // Ensure this is passed
  })
}

/* ****************************************
 *  Process Logout
 * ************************************ */
async function accountLogout(req, res) {
    res.clearCookie("jwt")
    req.flash("notice", "You have been logged out.")
    return res.redirect("/account/login")
}

/* ****************************************
 *  Deliver Update Account View
 * ************************************ */
async function showUpdateForm(req, res) {
    let nav = await utilities.getNav();
    res.render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        accountData: res.locals.accountData // ✅ Pass logged-in user data
    });
}

/* ****************************************
 *  Process Account Update (Name & Email)
 * ************************************ */
async function updateAccount(req, res) {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_id } = req.body;
    const result = await accountModel.updateAccount(
        account_firstname, 
        account_lastname, 
        account_email, 
        account_id
    );
    if (result) {
        const updatedAccount = await accountModel.getAccountById(account_id);
        res.locals.accountData = updatedAccount;
        req.flash("success", "Account updated successfully.");
        res.redirect("/account/");
    } else {
        req.flash("notice", "Error updating account.");
        res.status(501).render("account/update", {
            title: "Update Account",
            nav,
            errors: null,
            accountData: { ...res.locals.accountData, account_firstname, account_lastname, account_email }
        });
    }
}

/* ****************************************
 *  Process Password Update
 * ************************************ */
async function updatePassword(req, res) {
    let nav = await utilities.getNav();
    const { account_password, account_id } = req.body;
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(account_password, 10);
    } catch (error) {
        req.flash("notice", "Error processing password update.");
        res.status(500).render("account/update", {
            title: "Update Account",
            nav,
            errors: null,
            accountData: res.locals.accountData
        });
        return;
    }
    const result = await accountModel.updatePassword(hashedPassword, account_id);
    if (result) {
        req.flash("success", "Password updated successfully.");
        res.redirect("/account/");
    } else {
        req.flash("notice", "Error updating password.");
        res.status(501).render("account/update", {
            title: "Update Account",
            nav,
            errors: null,
            accountData: res.locals.accountData
        });
    }
}


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, accountLogout, showUpdateForm, updateAccount, updatePassword };
