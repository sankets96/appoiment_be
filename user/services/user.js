const { User } = require("../../db/models/user.js");

const add = async (info) => {
  return await new User(info).save();
};

const getuser = async (params={}) => {
  const {condition={},projection = {},options={}} = params;
  return await User.findOne(condition, projection, options);
};

module.exports = {
  add,
  getuser
};
