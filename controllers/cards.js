const Card = require('../models/card');
const { ERR_BAD_REQUEST, ERR_NOT_FOUND, ERR_DEFAULT } = require('../utils/constants');

module.exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find();
    res.status(200).send(cards);
  } catch (err) {
    res.status(ERR_DEFAULT).send({ message: 'Internal Server Error' });
  }
};

module.exports.createCard = async (req, res) => {
  const { name, link } = req.body;
  try {
    const card = await Card.create({
      name,
      link,
      owner: req.user._id,
    });
    res.status(201).send(card);
  } catch (err) {
    res.status(ERR_BAD_REQUEST).send({ message: 'Request Error' });
  }
};

module.exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndRemove(req.params.cardId);
    if (!card) {
      return res.status(ERR_NOT_FOUND).send({ message: 'Card not found' });
    }
    return res.status(200).send(card);
  } catch (err) {
    return res.status(ERR_BAD_REQUEST).send({ message: 'Request Error' });
  }
};

module.exports.likeCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );
    if (!card) {
      return res.status(ERR_NOT_FOUND).send({ message: 'Card not found' });
    }
    return res.status(200).send(card);
  } catch (err) {
    return res.status(ERR_BAD_REQUEST).send({ message: 'Request Error' });
  }
};

module.exports.dislikeCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );
    if (!card) {
      return res.status(ERR_NOT_FOUND).send({ message: 'Card not found' });
    }
    return res.status(200).send(card);
  } catch (err) {
    return res.status(ERR_BAD_REQUEST).send({ message: 'Request Error' });
  }
};
