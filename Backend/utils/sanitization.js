const xss = require('xss');

/**
 * Sanitize model fields before saving.
 * @param {Object} model - The Sequelize model instance.
 * @param {Array} fieldsToSanitize - An array of fields that should be sanitized.
 */
function sanitizeModelFields(model, fieldsToSanitize) {
  fieldsToSanitize.forEach((field) => {
    if (model[field]) {
      model[field] = xss(model[field]); // Apply XSS sanitization to each field
    }
  });
}

module.exports = sanitizeModelFields;
