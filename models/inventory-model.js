const pool = require("../database/") // Import the database connection

/* ***************************
 *  Get all classification data
 *************************** */
async function getClassifications() {
    return await pool.query(
        "SELECT * FROM public.classification ORDER BY classification_name"
    );
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i 
            JOIN public.classification AS c 
            ON i.classification_id = c.classification_id 
            WHERE i.classification_id = $1`,
            [classification_id]
        );
        return data.rows;
    } catch (error) {
        console.error("getInventoryByClassificationId error " + error);
    }
}

/* ***************************
 * Get vehicle details by inventoryId
 ************************** */
async function getVehicleById(inventoryId) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i 
             JOIN public.classification AS c 
             ON i.classification_id = c.classification_id 
             WHERE i.inv_id = $1`,
            [inventoryId]
        );
        console.log("Query Result:", data.rows); // Debugging
        return data.rows;
    } catch (error) {
        console.error("getVehicleById error:", error); // Debugging
        throw error;
    }
}

/* ***************************
 *  Add new classification
 * ************************** */
async function addClassification(classification_name) {
    try {
        const checkSql = "SELECT * FROM classification WHERE LOWER(classification_name) = LOWER($1)"
        const checkResult = await pool.query(checkSql, [classification_name])
        
        if (checkResult.rowCount) {
            throw new Error('Classification already exists')
        }

        const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
        return await pool.query(sql, [classification_name])
    } catch (error) {
        return null
    }
}

/* ***************************
 *  Delete classification
 * ************************** */
async function deleteClassification(classification_id) {
    try {
        const sql = "DELETE FROM classification WHERE classification_id = $1"
        const result = await pool.query(sql, [classification_id])
        return result.rowCount
    } catch (error) {
        return null
    }
}


/* ***************************
 *  Add new inventory item
 * ************************** */
async function addInventory(inv_data) {
    try {
        const sql = "INSERT INTO inventory (classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
        const data = await pool.query(sql, [
            inv_data.classification_id,
            inv_data.inv_make,
            inv_data.inv_model,
            inv_data.inv_year,
            inv_data.inv_description,
            inv_data.inv_image,
            inv_data.inv_thumbnail,
            inv_data.inv_price,
            inv_data.inv_miles,
            inv_data.inv_color
        ])
        return data.rows[0]
    } catch (error) {
        console.error("addInventory error " + error)
        return null
    }
}

// Export the functions
module.exports = {
    getClassifications,
    getInventoryByClassificationId,
    getVehicleById, 
    addClassification,
    deleteClassification,
    addInventory
};

