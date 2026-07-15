function isNonBlankString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function hasValidProductBody(body) {
  return (
    isNonBlankString(body.name) &&
    isNonBlankString(body.description) &&
    isNonBlankString(body.category) &&
    typeof body.price === 'number' &&
    Number.isFinite(body.price) &&
    body.price >= 0 &&
    Number.isInteger(body.stock) &&
    body.stock >= 0
  );
}

export function validateProductBody(req, res, next) {
  if (!hasValidProductBody(req.body)) {
    return res.status(400).json({ message: 'Invalid product body' });
  }
  return next();
}
