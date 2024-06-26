const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ***********************
 * Constructs the nav HTML unordered list
 * *********************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home Page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
            list += "</li>"
    })
    list += "</ul>"
    return list
}

/* ***********************
 * Build the classification view HTML
 * *********************** */
Util.buildClassificationGrid = async function(data) {
    let grid
    if (data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
            + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
            + 'details"><img src="' + vehicle.inv_thumbnail
            + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
            + '" on CSE Motors"></a>'
            grid += '<div class="namePrice">'
            grid += '<hr>'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
            + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
            + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

/* ***********************
 * Build the details view HTML
 * *********************** */
Util.buildDetailsGrid = async function(data) {
    let grid
    if (typeof data == "object") {
        grid = `<div class="detailsView">
                    <img src="${data.inv_image}" alt="${data.inv_name} Full Picture">
                    <div>
                    <h2>${data.inv_make} ${data.inv_model} Details</h2>
                        <ul>
                            <li><b>Price: $${new Intl.NumberFormat('en-US').format(data.inv_price)}</b></li>
                            <li><b>Description:</b> ${data.inv_description}</li>
                            <li><b>Color:</b> ${data.inv_color}</li>
                            <li><b>Miles:</b> ${new Intl.NumberFormat('en-US').format(data.inv_miles)}</li>
                        </ul>
                    </div>
                </div>`
    } else {
        grid = '<p class="notice">Sorry, no details found for this vehicle</p>'
    }
    return grid
}

/* ***********************
 * Build the reviews list in the details view HTML
 * *********************** */
Util.buildReviewsList = async function (inv_id) {
    const data = await invModel.getReviews(inv_id)
    let reviews = `<div id="reviews-container"><h3>Customer Reviews</h3>`
    if (data.length > 0) {
        reviews += `<ul class="reviews">`
        data.forEach(review => {
            reviews += `<li class="review-item">
                            <p><b>${review.name}</b> wrote on <em>${review.date}</em>:</p>
                            <p>${review.text}</p>
                        </li>`
        })
        reviews += `</ul>`
    } else {
        reviews += '<p class="notice">No reviews found for this vehicle. Be the first to review it!</p>'
    }
    reviews += `</div>`
    return reviews
}

/* ***********************
 * Build the reviews list in the account management view HTML
 * *********************** */
Util.buildReviewsListAccount = async function (account_id) {
    const data = await invModel.getReviewsByAccountId(account_id)
    let reviews = `<div id="reviews-container"><h3>My Reviews</h3>`
    if (data.length > 0) {
        reviews += `<ol class="reviews">`
        data.forEach(review => {
            reviews += `<li class="review-item">
                            <p>Reviewed the ${review.inv} on ${review.date} | <a href="/account/edit-review/${review.review_id}">Edit</a> | <a href="/account/delete-review/${review.review_id}">Delete</a></p>
                        </li>`
        })
        reviews += `</ol>`
    } else {
        reviews += '<p class="notice">You have not written any reviews yet.</p>'
    }
    reviews += `</div>`
    return reviews
}


/* ****************************
 * Build classification list
 * **************************** */
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList = `<select name="classification_id" id="classificationList" required><option `
    if (classification_id == null || !classification_id) {
        classificationList += `selected `
    }
    classificationList += `value="" disabled>Choose a Classification</option>`

    data.rows.forEach((row) => {
        classificationList += `<option value="${row.classification_id}"`
        if (classification_id != null && row.classification_id == classification_id) {
            classificationList += ` selected `
        }
        classificationList += `>${row.classification_name}</option>`
    })
    classificationList += `</select>`

    return classificationList
}

/* ****************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 ****************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************
 * Middleware to check token validity
 * **************************** */
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            function (err, accountData) {
                if (err) {
                    req.flash("Please log in")
                    res.clearCookie("jwt")
                    return res.redirect("/account/login")
                }
                res.locals.accountData = accountData
                res.locals.loggedin = 1
                next()
            }
        )
    } else {
        next()
    }
}

/* ****************************
 * Check login
 * **************************** */
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
        next()
    } else {
        req.flash("error", "Please log in.")
        return res.redirect("/account/login")
    }
}

/* ****************************
 * Middleware to check account authorization
 * **************************** */
Util.checkAuthorization = (req, res, next) => {
    if (res.locals.accountData) {
        const validTypes = ['Employee', 'Admin']
        
        if (validTypes.includes(res.locals.accountData.account_type)) {
            next()
        } else {
            req.flash("error", "Please log in with a valid administrator/employee account")
            return res.redirect("/account/login")
        }
    } else {
        req.flash("notice", "Please log in")
        return res.redirect("/account/login")
    }
}

/* ***********************
 * Middleware for checking credential to update account
 * *********************** */
Util.checkAccountId = async (req, res, next) => {
    const account_id = parseInt(req.params.account_id)
    try {
        if (account_id === res.locals.accountData.account_id) {
            next()
        } else {
            req.flash("error", "Not authorised.")
            return res.redirect("/account/")
        }
    } catch (error) {
        req.flash("notice", "Please log in")
        return res.redirect("/account/login")
    }
}


/* ***********************
 * Middleware for checking credential to update review
 * *********************** */
Util.checkAccountReviewId = async (req, res, next) => {
    const review_id = parseInt(req.params.review_id)
    const data = await invModel.getReviewById(review_id)
    try {
        if (data.account_id === res.locals.accountData.account_id) {
            next()
        } else {
            req.flash("error", "Not authorised.")
            return res.redirect("/account/")
        }
    } catch (error) {
        req.flash("error", "Not a valid review.")
        return res.redirect("/account/")
    }
}

module.exports = Util