const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const errorController = require("../controllers/errorController")

// Keep test route
router.get("/test", utilities.handleErrors((_req, _res, _next) => {
   throw new Error("Test error route")
}))

// Remove duplicate trigger route and use controller version
router.get("/trigger", utilities.handleErrors(errorController.trigger500Error))

module.exports = router