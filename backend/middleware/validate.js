const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    const errorDetails = err.issues || err.errors || [];
    return res.status(400).json({
      message: "Validation Error",
      errors: errorDetails.map(e => ({ path: e.path, message: e.message }))
    });
  }
};

module.exports = validate;
