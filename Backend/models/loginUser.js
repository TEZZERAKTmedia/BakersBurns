const pool = require('../config/pool');

const findUserByUsername = async (username) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return null;
    }
    return rows[0];
  } catch (error) {
    console.error(`Database query error: ${error.message}`);
    throw error;
  }
};

const findUserByEmail = async (email) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return null;
    }
    return rows[0];
  } catch (error) {
    console.error(`Database query error: ${error.message}`);
    throw error;
  }
};

module.exports = { findUserByUsername, findUserByEmail };
