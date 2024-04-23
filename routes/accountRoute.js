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
    util.handleErrors(accountController.accountLogin)
)

// Route to account management
router.get(
    "/",
    util.checkLogin,
    util.handleErrors(accountController.buildAccountManagement)
)

// Route to update account details view
router.get(
    "/update/:account_id",
    util.checkLogin,
    util.checkAccountId,
    util.handleErrors(accountController.buildUpdateAccount)
)

// Route to send data to update account details
router.post(
    "/update/:account_id",
    util.checkLogin,
    util.checkAccountId,
    validate.updateAccountRules(),
    validate.checkUpdateData,
    util.handleErrors(accountController.updateAccount)
)

// Route to send data to change password
router.post(
    "/update-pw/:account_id",
    util.checkLogin,
    util.checkAccountId,
    validate.changePasswordRules(),
    validate.checkChangePasswordData,
    util.handleErrors(accountController.changePassword)
)

// Route to logout
router.get("/logout/", util.checkLogin, util.handleErrors(accountController.logout))

module.exports = router