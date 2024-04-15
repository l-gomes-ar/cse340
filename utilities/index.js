const invModel = require("../models/inventory-model")
const Util = {}

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
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
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
                    <h2>${data.inv_name} Details</h2>
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

/* ****************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 ****************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util