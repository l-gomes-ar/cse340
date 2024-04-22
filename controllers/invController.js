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
    const vehicleName = `${data.inv_make} + ${data.inv_model}`
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
    const classificationSelect = await utilities.buildClassificationList()
    res.render("./inventory/", {
        title: 'Vehicle Management',
        nav,
        classificationSelect
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
        const classificationSelect = await utilities.buildClassificationList()
        req.flash("success", "New classification added.")
        res.status(201).render("./inventory/", {
            title: "Vehicle Management",
            nav,
            errors: null,
            classificationSelect
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
        const classificationSelect = await utilities.buildClassificationList()
        req.flash("success", "New inventory added.")
        res.status(201).render("./inventory/", {
            title: "Vehicle Management",
            nav,
            errors: null,
            classificationSelect
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

/* **************************
 * Return inventory by classification as JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error("No data returned"))
    }
}


/* **********************************
 * Build view for editing inventory 
 * ********************************** */
invCont.buildEditInventory = async function (req, res, next) {
    let inventoryId = parseInt(req.params.inventory_id)
    let nav = await utilities.getNav()
    let inventoryData = await invModel.getDetailsByInvId(inventoryId)
    let inventoryName = `${inventoryData.inv_make} ${inventoryData.inv_model}`
    const classificationList = await utilities.buildClassificationList(inventoryData.classification_id)
    res.render("./inventory/edit-inventory", {
        title: "Edit " + inventoryName,
        nav,
        errors: null,
        classificationList,
        inv_id: inventoryData.inv_id,
        inv_make: inventoryData.inv_make,
        inv_model: inventoryData.inv_model,
        inv_year: inventoryData.inv_year,
        inv_description: inventoryData.inv_description,
        inv_image: inventoryData.inv_image,
        inv_thumbnail: inventoryData.inv_thumbnail,
        inv_price: inventoryData.inv_price,
        inv_miles: inventoryData.inv_miles,
        inv_color: inventoryData.inv_color,
        classification_id: inventoryData.classification_id
    })
}

/* ************************
 * Update inventory
 * ************************ */
invCont.updateInventory = async function (req, res, next) {
    let nav = await utilities.getNav()

    const {
        classification_id,
        inv_id,
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

    const updateResult = await invModel.updateInventory(
        classification_id,
        inv_id,
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

    if (updateResult) {
        const inventoryName = `${updateResult.inv_make} ${updateResult.inv_model}`
        req.flash("success", `${inventoryName} successfully updated.`)
        res.redirect("/inv/")
    } else {
        const inventoryName = `${inv_make} ${inv_model}`
        const classificationList = await utilities.buildClassificationList(classification_id)

        req.flash("error", "Sorry, the insert failed.")
        res.status(501).render("./inventory/edit-inventory", {
            title: "Edit " + inventoryName,
            nav,
            errors: null,
            classificationList,
            classification_id,
            inv_make, 
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            inv_id
        })
    }
}

/* **********************************
 * Build view for confirmation of deleting inventory 
 * ********************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
    let inventoryId = parseInt(req.params.inventory_id)
    let nav = await utilities.getNav()
    let inventoryData = await invModel.getDetailsByInvId(inventoryId)
    let inventoryName = `${inventoryData.inv_make} ${inventoryData.inv_model}`
    const classificationList = await utilities.buildClassificationList(inventoryData.classification_id)
    res.render("./inventory/delete-confirm", {
        title: "Delete " + inventoryName,
        nav,
        errors: null,
        classificationList,
        inv_id: inventoryData.inv_id,
        inv_make: inventoryData.inv_make,
        inv_model: inventoryData.inv_model,
        inv_year: inventoryData.inv_year,
        inv_price: inventoryData.inv_price,
    })
}

/* ************************
 * Delete inventory
 * ************************ */
invCont.deleteInventory = async function (req, res, next) {
    const {
        inv_id,
        inv_make,
        inv_model
    } = req.body
    let invId = parseInt(inv_id)

    const deleteResult = await invModel.deleteInventory(
        invId
    )

    const inventoryName = `${inv_make} ${inv_model}`

    if (deleteResult) {
        req.flash("success", `${inventoryName} successfully deleted.`)
        res.redirect("/inv/")
    } else {
        req.flash("error", "Sorry, could not delete inventory")
        res.status(501).redirect(`/inv/delete/${inv_id}`)
    }
}

module.exports = invCont