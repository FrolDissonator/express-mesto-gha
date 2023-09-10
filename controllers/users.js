const User = require('../models/user');
const { ERR_BAD_REQUEST, ERR_NOT_FOUND, ERR_DEFAULT } = require('../utils/constants');

module.exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (err) {
    res.status(ERR_DEFAULT).send({ message: 'Internal Server Error' });
  }
};

module.exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(ERR_NOT_FOUND).send({ message: 'User not found' });
    }
    return res.status(200).send(user);
  } catch (err) {
    return res.status(ERR_DEFAULT).send({ message: 'Internal Server Error' });
  }
};

module.exports.createUser = async (req, res) => {
  const { name, about, avatar } = req.body;
  try {
    const user = await User.create({ name, about, avatar });
    res.status(201).send(user);
  } catch (err) {
    res.status(ERR_BAD_REQUEST).send({ message: 'Request Error' });
  }
};

module.exports.updateProfile = async (req, res) => {
  const { name, about } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
    );
    if (!updatedUser) {
      return res.status(ERR_NOT_FOUND).send({ message: 'User not found' });
    }
    return res.status(200).send(updatedUser);
  } catch (err) {
    return res.status(ERR_BAD_REQUEST).send({ message: 'Request Error' });
  }
};

module.exports.updateAvatar = async (req, res) => {
  const { avatar } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    );
    if (!updatedUser) {
      return res.status(ERR_NOT_FOUND).send({ message: 'User not found' });
    }
    return res.status(200).send(updatedUser);
  } catch (err) {
    return res.status(ERR_BAD_REQUEST).send({ message: 'Request Error' });
  }
};
