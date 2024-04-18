// Needed Resources
const express = require("express")
const router = express.Router()
const util = require("../utilities/")
const accountController = require("../controllers/accountController")
const validate = require("../utilities/account-validation")

// Route to build login view
router.get("/login", util.handleErrors(accountController.buildLogin))

// Route to build registration view
router.get("/register", util.handleErrors(accountController.buildRegister))

// Route to send registration details
router.post(
    "/register",
    validate.registrationRules(),
    validate.checkRegData,
    util.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
    "/login",
    validate.loginRules(),
    validate.checkLoginData,
    (req, res) => {
        res.status(200).send('login process')
    }
)

module.exports = router