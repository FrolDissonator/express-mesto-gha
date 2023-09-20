const Card = require('../models/card');
const ApiError = require('../errors/ApiError');

module.exports.getCards = async (req, res, next) => {
  try {
    const cards = await Card.find();
    res.status(200).send(cards);
  } catch (err) {
    next(ApiError.internal('Ошибка сервера'));
  }
};

module.exports.createCard = async (req, res, next) => {
  const { name, link } = req.body;
  try {
    const card = await Card.create({
      name,
      link,
      owner: req.user._id,
    });
    res.status(201).send(card);
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(ApiError.badRequest('Ошибка валидации'));
    } else {
      next(ApiError.internal('Ошибка сервера'));
    }
  }
};

// eslint-disable-next-line consistent-return
module.exports.deleteCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const userId = req.user._id;
    const card = await Card.findById(cardId);

    if (!card) {
      return next(ApiError.notFound('Карточка не найдена'));
    }
    if (card.owner.toString() !== userId) {
      return next(ApiError.forbidden('Вы не можете удалить эту карточку'));
    }

    const deletedCard = await Card.deleteOne(card);

    if (!deletedCard) {
      return next(ApiError.notFound('Карточка не найдена'));
    }

    res.status(200).send({ data: deletedCard });
  } catch (err) {
    next(ApiError.internal('Ошибка сервера'));
  }
};

module.exports.likeCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );

    if (!card) {
      next(ApiError.notFound('Карточка не найдена'));
    } else {
      res.status(200).send(card);
    }
  } catch (err) {
    if (err.name === 'CastError') {
      next(ApiError.badRequest('Неверный запрос'));
    } else {
      next(ApiError.internal('Ошибка сервера'));
    }
  }
};

module.exports.dislikeCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );

    if (!card) {
      next(ApiError.notFound('Карточка не найдена'));
    } else {
      res.status(200).send(card);
    }
  } catch (err) {
    if (err.name === 'CastError') {
      next(ApiError.badRequest('Неверный запрос'));
    } else {
      next(ApiError.internal('Ошибка сервера'));
    }
  }
};
