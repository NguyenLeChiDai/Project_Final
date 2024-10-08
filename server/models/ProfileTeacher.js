const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TeacherSchema = new Schema({
  teacherId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },

  gender: {
    type: String,
    required: false,
  },
  major: {
    type: String,
    required: false,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true, // Bắt buộc có liên kết với người dùng
  },
});

module.exports = mongoose.model("profileTeacher", TeacherSchema);
