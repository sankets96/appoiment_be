const { User } = require("../../db/models/User.js");

const createUser = async (data) => {
  return await User.create(data);
};

const getUsers = async () => {
  return await User.find({ isDeleted: false });
};

module.exports = {
  createUser,
  getUsers
};
