const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const ApiError = require('../errors/ApiError');

module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findUserByCredentials(email, password);

    if (!user) {
      return next(ApiError.notFound('Пользователь не найден'));
    }

    const token = jwt.sign(
      { _id: user._id },
      'some-secret-key',
      { expiresIn: '7d' },
    );

    return res.status(200).send({ token });
  } catch (err) {
    return next(ApiError.unauthorized('Ошибка авторизации'));
  }
};

module.exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (err) {
    next(ApiError.internal('Ошибка сервера'));
  }
};

module.exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(ApiError.notFound('Пользователь не найден'));
    }
    return res.status(200).send(user);
  } catch (err) {
    if (err.name === 'CastError') {
      return next(ApiError.badRequest('Неверный запрос'));
    }
    return next(ApiError.internal('Ошибка сервера'));
  }
};

module.exports.createUser = async (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      about,
      avatar,
      email,
      password: hashedPassword,
    });
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(201).send(userResponse);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(ApiError.badRequest('Ошибка валидации'));
    }
    if (err.code === 11000) {
      return next(ApiError.alreadyExists('Пользователь с таким email уже существует'));
    }
    return next(ApiError.internal('Ошибка сервера'));
  }
};

module.exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(ApiError.notFound('Пользователь не найден'));
    }
    return res.status(200).send(user);
  } catch (err) {
    return next(ApiError.internal('Ошибка сервера'));
  }
};

module.exports.updateProfile = async (req, res, next) => {
  const { name, about } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    );
    if (!updatedUser) {
      return next(ApiError.notFound('Пользователь не найден'));
    }
    return res.status(200).send(updatedUser);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(ApiError.badRequest('Ошибка валидации'));
    }
    return next(ApiError.internal('Ошибка сервера'));
  }
};

module.exports.updateAvatar = async (req, res, next) => {
  const { avatar } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    );
    if (!updatedUser) {
      return next(ApiError.notFound('Пользователь не найден'));
    }
    return res.status(200).send(updatedUser);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(ApiError.badRequest('Ошибка валидации'));
    }
    return next(ApiError.internal('Ошибка сервера'));
  }
};
