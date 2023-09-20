const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const ApiError = require('../errors/ApiError');
const { urlRegex } = require('../utils/constants');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minlength: [2, 'Текст не может быть короче 2 символов'],
    maxlength: [30, 'Текст не может быть длиннее 30 символов'],
  },
  about: {
    type: String,
    default: 'Исследователь',
    minlength: [2, 'Текст не может быть короче 2 символов'],
    maxlength: [30, 'Текст не может быть длиннее 30 символов'],
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (v) => urlRegex.test(v),
      message: 'Некорректная ссылка',
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v),
      message: 'Некорректный адрес электронной почты',
    },
  },
  password: {
    type: String,
    required: [true, 'Заполните это поле'],
    select: false,
  },
}, { versionKey: false });

userSchema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw ApiError.unauthorized('Неверные email или пароль');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw ApiError.unauthorized('Неверные email или пароль');
          }

          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
