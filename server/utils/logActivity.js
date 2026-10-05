const Activity = require("../models/Activity");

module.exports = (project, user, message) =>
  Activity.create({ project, user, message }).catch(() => {});