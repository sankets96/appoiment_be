const { User } = require("../../db/models/user.js");

const add = async (info) => {
  return await new User(info).save();
};

const getuser = async (params={}) => {
  const {condition={},projection = {},options={}} = params;
  return await User.findOne(condition, projection, options);
};

const update = async (id, data) => {
  return await User.findByIdAndUpdate(id, data, { new: true });
};

module.exports = {
  add,
  getuser,
  update
};
