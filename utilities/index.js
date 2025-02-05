const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications();
    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    data.rows.forEach((row) => {
        list += "<li>";
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>";
        list += "</li>";
    });
    list += "</ul>";
    return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
    let grid;
    if (data.length > 0) {
        grid = '<ul id="inv-display">';
        data.forEach((vehicle) => {
            grid += '<li>';
            grid += `
                <a href="/inv/detail/${vehicle.inv_id}" 
                   title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                    <img src="${vehicle.inv_image}" 
                         alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors">
                </a>`;
            grid += `
                <div class="namePrice">
                    <hr>
                    <h2>
                        <a href="/inv/detail/${vehicle.inv_id}" 
                           title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                            ${vehicle.inv_make} ${vehicle.inv_model}
                        </a>
                    </h2>
                    <span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>
                </div>`;
            grid += '</li>';
        });
        grid += '</ul>';
    } else {
        grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
    }
    return grid;
};

/* ***************************
 * Build the vehicle detail view HTML
 * ************************** */
Util.buildVehicleDetailView = function (vehicle) {
    if (!vehicle) {
        return `<p class="notice">Vehicle details not found.</p>`;
    }

    let detailHTML = `
        <div class="vehicle-detail-page">
            <div class="vehicle-detail">
                <div class="vehicle-image">
                    <img src="${vehicle.inv_image || "/images/default.jpg"}" 
                        alt="Image of ${vehicle.inv_make || "Unknown Make"} ${vehicle.inv_model || "Unknown Model"}">
                </div>
                <div class="vehicle-info">
                    <h2>${vehicle.inv_make || "Unknown Make"} ${vehicle.inv_model || "Unknown Model"}</h2>
                    <p><strong>Year:</strong> ${vehicle.inv_year || "Unknown Year"}</p>
                    <p><strong>Price:</strong> $${vehicle.inv_price ? new Intl.NumberFormat("en-US").format(vehicle.inv_price) : "N/A"}</p>
                    <p><strong>Mileage:</strong> ${vehicle.inv_miles ? new Intl.NumberFormat("en-US").format(vehicle.inv_miles) : "N/A"} miles</p>
                    <p><strong>Description:</strong> ${vehicle.inv_description || "No description available."}</p>
                </div>
            </div>
        </div>
    `;
    return detailHTML;
};

/* ***************************
 * Build the vehicle form view HTML
 * ************************** */
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
        '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
        classificationList += '<option value="' + row.classification_id + '"'
        if (classification_id != null && row.classification_id == classification_id) {
            classificationList += " selected "
        }
        classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
};

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
    // Check if this is a protected route (/account/ paths except login and register, and all /inv paths)
    if ((req.originalUrl.startsWith('/account') && 
        req.originalUrl !== '/account/login' && 
        req.originalUrl !== '/account/register') || 
        req.originalUrl.startsWith('/inv')) {  
        
        // If no token when accessing protected route
        if (!req.cookies.jwt) {
            return res.redirect('/account/login');
        }
        // If token exists, verify it
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            function (err, accountData) {
                if (err) {
                    res.clearCookie("jwt")
                    return res.redirect("/account/login")
                }
                res.locals.accountData = accountData
                res.locals.loggedin = 1
                next()
            }
        )
    } else {
        // Not a protected route
        next()
    }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
        next()
    } else {
        req.flash("notice", "Please log in.")
        // Store the original URL the person was trying to visit
        req.session.returnTo = req.originalUrl
        return res.redirect("/account/login")
    }
};

module.exports = Util;