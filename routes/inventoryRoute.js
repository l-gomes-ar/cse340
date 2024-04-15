// Needed Resources
const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const util = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", util.handleErrors(invController.buildByClassificationId))
router.get("/detail/:invId", util.handleErrors(invController.buildByInvId))

module.exports = router