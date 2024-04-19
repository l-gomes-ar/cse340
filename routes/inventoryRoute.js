// Needed Resources
const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const util = require("../utilities/")
const validate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", util.handleErrors(invController.buildByClassificationId))

// Route to build view for the details by inventory id
router.get("/detail/:invId", util.handleErrors(invController.buildByInvId))

// Route to build management view
router.get("/", util.handleErrors(invController.buildManagement))

// Route to build add new classification view
router.get("/add-classification", util.handleErrors(invController.buildAddClassification))

// Route for sending data for new classification
router.post(
    "/add-classification",
    validate.classificationRules(),
    validate.checkClassification,
    util.handleErrors(invController.addClassification)
)

// Route to build add new inventory view
router.get("/add-inventory", util.handleErrors(invController.buildAddInventory))

// Route for sending data for new inventory
router.post(
    "/add-inventory",
    validate.inventoryRules(),
    validate.checkInventory,
    util.handleErrors(invController.addInventory)
)

module.exports = router