const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

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

/* **********************
 * Process login request
 * ********************** */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)

    if (!accountData) {
        req.flash("error", "Please, check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email
        })
        return
    }

    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
            
            if (process.env.NODE_ENV === "development") {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            }
            return res.redirect("/account/")
        } else {
            req.flash("error", "Please, check your credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email
            })
            return
        }
    } catch (error) {
        return new Error("Access Forbidden")
    }
}

/* *******************
 * Build account management view
 * ******************* */
async function buildAccountManagement(req, res) {
    let nav = await utilities.getNav()
    res.render("account/", {
        title: "Account Management",
        nav
    })
}

/* ********************
 * Build account update view
 * ******************** */
async function buildUpdateAccount(req, res) {
    let nav = await utilities.getNav()
    try {
        const accountId = parseInt(req.params.account_id)
        const data = await accountModel.getAccountById(accountId)
        
        if (data) {
            res.render("account/update", {
                title: "Update Account Information",
                nav,
                errors: null,
                account_firstname: data.account_firstname,
                account_lastname: data.account_lastname,
                account_email: data.account_email,
                account_id: accountId
            })
        } else {
            req.flash("error", "Not a valid account Id!")
            return res.redirect("/account/")
        }

    } catch (error) {
        return new Error("buildupdateaccount error " + error)
    }
}

/* ****************
 * Process update account details
 * **************** */
async function updateAccount(req, res) {
    const { account_id, account_firstname, account_lastname, account_email } = req.body
    const accountId = parseInt(account_id)
    const updateResult = await accountModel.updateAccount(accountId, account_firstname, account_lastname, account_email)

    // Update current jws token with new account data
    const accountData = await accountModel.getAccountById(accountId)
    delete accountData.account_password
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })

    if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }

    if (updateResult) {
        req.flash("success", "Congratulations, your information has been updated.")
    } else {
        req.flash("error", "I'm sorry, could not update your information")
    }
    return res.redirect("/account/")
}

/* ****************
 * Process change password details
 * **************** */
async function changePassword(req, res) {
    const { account_id, account_password } = req.body
    const accountId = parseInt(account_id)

    // Hash password before storing 
    let hashedPassword
    try {
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("error", "Sorry, there was an error processing your password.")
        return res.status.redirect(`/account/update/${accountId}`)
    }

    const updateResult = await accountModel.changePassword(accountId, hashedPassword)

    if (updateResult) {
        req.flash("success", "Congratulations, your password has been updated.")
    } else {
        req.flash("error", "I'm sorry, could not update your password")
    }
    return res.redirect("/account/")
}

/* *********************
 * Log Out user
 * ********************* */
function logout(req, res) {
    res.clearCookie("jwt")
    req.flash("notice", "Logged out.")
    return res.redirect("/")
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildUpdateAccount, updateAccount, changePassword, logout }