// Needed Resources
const express = require("express")
const router = express.Router()
const util = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

// Route to build login view
router.get("/login/", util.handleErrors(accountController.buildLogin))

// Route to build registration view
router.get("/register/", util.handleErrors(accountController.buildRegister))

// Route to send registration details
router.post(
    "/register/",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    util.handleErrors(accountController.registerAccount)
)

module.exports = router