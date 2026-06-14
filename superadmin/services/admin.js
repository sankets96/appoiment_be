const { Admin } = require("../../db/models/superadmin.js");

const add = async (info) => {
  return await new Admin(info).save();
};

const getadmin = async (params={}) => {
  const {condition={},projection = {},options={}} = params;
  return await Admin.findOne(condition, projection, options);
};

const get = async (params = {}) => {
  const { condition = {}, projection = {}, options = {} } = params;
  return await Admin.findOne(condition, projection, options);
};

const update = async (id, updates) => {
  return await Admin.findByIdAndUpdate(id, updates, { new: true });
};

module.exports = {
  add,
  getadmin,
  get,
  update
};
