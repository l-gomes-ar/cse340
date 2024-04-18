const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

/* ******************
 * Deliver login view
 * ****************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null
    })
}

/* ******************
 * Deliver registration view
 * ****************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Registration",
        nav,
        errors: null
    })
}

/* ******************
 * Process registration
 * ****************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash password before storing 
    let hashedPassword
    try {
        // Regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("error", "Sorry, there was an error processing the registration.")
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null
        })
    }

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (regResult) {
        req.flash(
            "success",
            `Congratulations! You're registered, ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null
        })
    } else {
        req.flash("error", "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: null
        })
    }
}

module.exports = { buildLogin, buildRegister, registerAccount }