const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")

/* ************************
 * Registration data validation rules
 * ************************ */
validate.registrationRules = () => {
    return [
        // Firstname is required and must be a string
        body("account_firstname")
            .trim()
            .notEmpty()
            .escape()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name."), // On error, this message is sent.
        
        // Lastname is required and mustbe a string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name."), // On error, this message is sent.
        
        // Valid email is required and cannot already exist in the database
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (emailExists) {
                    throw new Error("Email exists. Please log in or use a different email address.")
                }
            }),
        
        // Password is required and must be a strong password
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            })
            .withMessage("Password does not meet requirements.")
    ]
}

/* ************************
 * Check data and return errors or continue to registration
 * ************************ */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/register", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email
        })
        return
    }
    next()
}

/* ************************
 * Login data validation rules
 * ************************ */
validate.loginRules = () => {
    return [
        // Email is required, and must exist
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required."),

        // Password is required and must be a strong password
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            })
            .withMessage("A valid password is required.")
    ]
}

/* ************************
 * Check data and return errors or continue to login
 * ************************ */
validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email
        })
        return
    }
    next()
}

/* ************************
 * Account update data validation rules
 * ************************ */
validate.updateAccountRules = () => {
    return [
        body("account_firstname")
            .trim()
            .notEmpty()
            .escape()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name."),
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name."),
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid unique email is required.")
    ]
}

/* ************************
 * Check data and return errors or continue to update account details
 * ************************ */
validate.checkUpdateData = async (req, res, next) => {
    let { account_firstname, account_lastname, account_email, account_id } = req.body
    const accountId = parseInt(req.params.account_id)
    let errors = []
    errors = validationResult(req)

    // Check if email exists, ignore if it belongs to user
    const emailExists = await accountModel.checkExistingEmail(account_email)
    let ignore
    if (emailExists) {
        const data = await accountModel.getAccountById(parseInt(req.params.account_id))
        if (data.account_email === account_email) {
            ignore = true
        } else {
            ignore = false
        }
    }

    if (!errors.isEmpty() || accountId != account_id || ignore === false) {
        if (ignore === false) {
            req.flash("error", "Email already being used. Please enter a different email address.")
        } else if (accountId != account_id) {
            // Update value for account_id with the one passed through the form
            account_id = accountId
            req.flash("error", "Invalid account id.")
        }

        let nav = await utilities.getNav()
        res.render("account/update", {
            errors,
            title: "Update Account Information",
            nav,
            account_firstname,
            account_lastname,
            account_email,
            account_id
        })
        return
    }
    next()
}

/* ************************
 * Change password data validation rules
 * ************************ */
validate.changePasswordRules = () => {
    return [
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            })
            .withMessage("Password does not meet requirements.")
    ]
}

/* ************************
 * Check data and return errors or continue to change password
 * ************************ */
validate.checkChangePasswordData = async (req, res, next) => {
    let { account_id } = req.body
    let errors = []
    errors = validationResult(req)

    const accountId = parseInt(req.params.account_id)
    const data = await accountModel.getAccountById(accountId)

    if (!errors.isEmpty() || accountId != account_id) {
        if (accountId != account_id) {
            // Update value for account_id with the one passed through the form
            account_id = accountId
            req.flash("error", "Invalid account id.")
        }

        let nav = await utilities.getNav()
        res.render("account/update", {
            errors,
            title: "Update Account Information",
            nav,
            account_firstname: data.account_firstname,
            account_lastname: data.account_lastname,
            account_email: data.account_email,
            account_id
        })
        return
    }
    next()
}

module.exports = validate