const pool = require("../database/")

/* **************************
 * Get all classification data
 * ************************** */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* **************************
 * Get classification name by id
 * ************************** */
async function getClassificationById(classification_id) {
    let data = await pool.query("SELECT classification_name FROM public.classification WHERE classification_id = $1", [classification_id])
    return data.rows
}

/* **************************
 * Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = $1`,
            [classification_id]
        )

        return data.rows
    } catch (error) {
        console.error("getclassificationbyid error " + error)
    }
}

/* **************************
 * Get all details by inventory id
 * ************************** */
async function getDetailsByInvId(invId) {
    try {
        const data = await pool.query(
            `SELECT 
                inv_make,
                inv_model,
                inv_year,
                inv_description,
                inv_image,
                inv_thumbnail,
                inv_price,
                inv_miles,
                inv_color,
                classification_id,
                inv_id
            FROM
                public.inventory
            WHERE
                inv_id = $1`,
            [invId]
        )
        return data.rows[0]
    } catch (error) {
        console.error("getdetailsbyinvid error " + error)
    }
}

/* ***********************
 * Add new classification
 * *********************** */
async function addClassification(classification_name) {
    try {
        const sql = "INSERT INTO public.classification (classification_name) VALUES ($1)"
        const addResult = await pool.query(sql, [classification_name])
        return addResult;
    } catch (error) {
        console.error("addclassification error " + error)
    }
}

/* ***********************
 * Add new inventory
 * *********************** */
async function addInventory(classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color) {
    try {
        const sql = `INSERT INTO public.inventory 
                        (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`

        const addResult = await pool.query(sql, [
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
        ])

        return addResult;
    } catch (error) {
        console.error("addinventory error " + error)
    }
}

/* ***********************
 * Update inventory
 * *********************** */
async function updateInventory(classification_id, inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color) {
    try {
        const sql = `UPDATE
                         public.inventory 
                     SET
                         classification_id = $1,
                         inv_make = $2,
                         inv_model = $3,
                         inv_description = $4,
                         inv_image = $5,
                         inv_thumbnail = $6,
                         inv_price = $7,
                         inv_year = $8, 
                         inv_miles = $9,
                         inv_color = $10
                     WHERE
                         inv_id = $11
                     RETURNING *`

        const updateResult = await pool.query(sql, [
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
        ])

        return updateResult.rows[0];
    } catch (error) {
        console.error("updateinventory error " + error)
    }
}

/* ************************
 * Delete Inventory
 * ************************ */
async function deleteInventory(inv_id) {
    try {
        const sql = `DELETE FROM public.inventory WHERE inv_id = $1`
        const deleteResult = await pool.query(sql, [inv_id])

        return deleteResult
    } catch (error) {
        console.error("deleteinventory error " + error)
    }
}


module.exports = { getClassifications, getClassificationById, getInventoryByClassificationId, getDetailsByInvId, addClassification, addInventory, updateInventory, deleteInventory }