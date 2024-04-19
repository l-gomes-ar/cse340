const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* **********************************
 * Build inventory by classification view
 * ********************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    let className 
    if (data.length > 0) {
        className = data[0].classification_name
    } else {
        const data2 = await invModel.getClassificationById(classification_id)
        className = data2[0].classification_name
    }
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid
    })
}

/* **********************************
 * Build detail page by inventory id view
 * ********************************** */
invCont.buildByInvId = async function (req, res, next) {
    const invId = req.params.invId;
    const data = await invModel.getDetailsByInvId(invId)
    const grid = await utilities.buildDetailsGrid(data)
    let nav = await utilities.getNav()
    const vehicleName = data.inv_name
    res.render("./inventory/details", {
        title: vehicleName,
        nav,
        grid
    })
}

/* **********************************
 * Build management view
 * ********************************** */
invCont.buildManagement = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("./inventory/management", {
        title: 'Vehicle Management',
        nav
    })
}

/* **********************************
 * Build view for adding new classification 
 * ********************************** */
invCont.buildAddClassification = async function (req, res, next) {
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null
    })
}

/* **********************************
 * Add classification
 * ********************************** */
invCont.addClassification = async function (req, res, next) {
    const { classification_name } = req.body
    const addResult = await invModel.addClassification(classification_name)
    let nav = await utilities.getNav()

    if (addResult) {
        req.flash("success", "New classification added.")
        res.status(201).render("./inventory/management", {
            title: "Vehicle Management",
            nav,
            errors: null
        })
    } else {
        req.flash("error", "Sorry, could not add classification.")
        res.status(501).render("./inventory/add-classification", {
            title: "Add New Classification",
            nav,
            errors: null
        })
    }
}

/* **********************************
 * Build view for adding new inventory 
 * ********************************** */
invCont.buildAddInventory = async function (req, res, next) {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render("./inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        errors: null,
        classificationList
    })
}

/* **********************************
 * Add inventory
 * ********************************** */
invCont.addInventory = async function (req, res, next) {
    const {
        classification_id,
        inv_make, 
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color
    } = req.body

    const addResult = await invModel.addInventory(
        classification_id,
        inv_make, 
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color
    )

    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)

    if (addResult) {
        req.flash("success", "New inventory added.")
        res.status(201).render("./inventory/management", {
            title: "Vehicle Management",
            nav,
            errors: null
        })
    } else {
        req.flash("error", "Sorry, could not add inventory.")
        res.status(501).render("./inventory/add-inventory", {
            title: "Add Inventory",
            nav,
            errors: null,
            classificationList,
            classification_id,
            inv_make, 
            inv_model,
            inv_description,
            inv_price,
            inv_year,
            inv_miles,
            inv_color
        })
    }
}

module.exports = invCont