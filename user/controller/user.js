const UserService = require("../services/user.js");
const msg = require("../../utils/message.js");
const createUser = async (req, res) => {
  try {
    let {name,email}=req.body
    const user = await UserService.add({name,email});
    res.status(201).json({
      success: true,
      data: msg.USER_ADD_SucessFULLY
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

const getUsers = async (req, res) => {
  const users = await UserService.getuser();
  res.json({
    success: true,
    data: users
  });
};

module.exports = {
  createUser,
  getUsers
};
