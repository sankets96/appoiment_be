const UserService = require("../services/user.js");

const createUser = async (req, res) => {
  try {
    const user = await UserService.createUser(req.body);
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

const getUsers = async (req, res) => {
  const users = await UserService.getUsers();
  res.json({
    success: true,
    data: users
  });
};

module.exports = {
  createUser,
  getUsers
};
