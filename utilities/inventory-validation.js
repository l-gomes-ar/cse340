const utilities = require(".")
const invModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator")
const validate = {}

/* ************************
 * Classification data validation rules
 * ************************ */
validate.classificationRules = () => {
    return [
        body("classification_name")
            .trim()
            .notEmpty()
            .escape()
            .isAlpha()
            .withMessage("Classification name cannot contain any space or special characters.")
    ]
}

/* ************************
 * Check data and return errors or continue to insert classification
 * ************************ */
validate.checkClassification = async (req, res, next) => {
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("./inventory/add-classification", {
            errors,
            title: "Add New Classification",
            nav
        })
        return
    }
    next()
}

/* *********************
 * Inventory data validation rules
 * ********************* */
validate.inventoryRules = () => {
    return [
        body("classification_id")
            .trim()
            .notEmpty()
            .isNumeric()
            .custom(async (classification_id) => {
                let data = await invModel.getClassifications()
                const classificationIds = data.rows.map((row) => row.classification_id)
                
                if (!classificationIds.includes(parseInt(classification_id))) {
                    throw new Error("Please, select a valid classification.")
                }
            }),
        body("inv_make")
            .trim()
            .notEmpty()
            .isLength({ min: 3 })
            .isAlphanumeric("en-US", {ignore: " "})
            .withMessage("Vehicle make must be alphanumeric and have at least 3 characters."),
        body("inv_model")
            .trim()
            .notEmpty()
            .isLength({ min: 3 })
            .isAlphanumeric("en-US", {ignore: " "})
            .withMessage("Vehicle model must be alphanumeric and have at least 3 characters."),
        body("inv_description")
            .trim()
            .notEmpty()
            .escape()
            .withMessage("The vehicle description is required."),
        body("inv_image")
            .trim()
            .notEmpty()
            .equals("/images/vehicles/no-image.png")
            .withMessage("Vehicle image path should match the 'no image' path."),
        body("inv_thumbnail")
            .trim()
            .notEmpty()
            .equals("/images/vehicles/no-image-tn.png")
            .withMessage("Vehicle thumbnail image path should match the 'no image' path."),
        body("inv_price")
            .trim()
            .notEmpty()
            .isDecimal({
                decimal_digits: '0,2'
            })
            .withMessage("Vehicle price must be a number with no more than two decimal digits."),
        body("inv_year")
            .trim()
            .notEmpty()
            .isInt({ min: 1885, max: 2024})
            .withMessage("Vehicle year must be a valid 4 digit number between 1885 and 2024."),
        body("inv_miles")
            .trim()
            .notEmpty()
            .isFloat({ min: 0 })
            .withMessage("Vehicle mileage must be a valid positive number"),
        body("inv_color")
            .trim()
            .notEmpty()
            .isAlpha()
            .withMessage("Vehicle color is required and must be a valid name.")
    ]
}

/* ************************
 * Check data and return errors or continue to insert inventory
 * ************************ */
validate.checkInventory = async (req, res, next) => {
    const {
        classification_id,
        inv_make, 
        inv_model,
        inv_description,
        inv_price,
        inv_year,
        inv_miles,
        inv_color
    } = req.body

    let errors = []
    errors = validationResult(req)

    const classificationList = await utilities.buildClassificationList(classification_id)

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("./inventory/add-inventory", {
            errors,
            title: "Add Inventory",
            nav,
            classificationList,
            inv_make, 
            inv_model,
            inv_description,
            inv_price,
            inv_year,
            inv_miles,
            inv_color
        })
        return
    }
    next()
}

module.exports = validate