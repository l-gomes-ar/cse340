const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

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

module.exports = validate