const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  studentId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
  major: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  groupName: {
    type: String,
    required: true,
  },
  groupStatus: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
});

module.exports = mongoose.model("posts", PostSchema);
