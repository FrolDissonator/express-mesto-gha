const jwt = require('jsonwebtoken');
const ApiError = require('../errors/ApiError');

const {
  NODE_ENV = 'development',
  JWT_SECRET = 'supersecretkey',
} = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Необходима авторизация'));
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'supersecretkey');
  } catch (err) {
    return next(ApiError.unauthorized('Некорректный токен'));
  }

  req.user = payload;

  return next();
};
