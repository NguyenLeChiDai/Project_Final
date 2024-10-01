const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentGroupSchema = new Schema({
  groupId: {
    type: String,
    required: false,
  },
  groupName: {
    type: String,
    required: false,
  },
  groupStatus: {
    type: String,
    enum: ["0/2", "1/2", "2/2"], // Chỉ cho phép 'Sinh Viên' hoặc 'admin', "teacher"
    default: "0/2",
  },
  profileStudents: [
    {
      student: {
        type: Schema.Types.ObjectId,
        ref: "profileStudent",
        required: false,
      },
      role: {
        type: String,
        enum: ["Nhóm trưởng", "Thành viên"],
        required: true,
      },
    },
  ],

  topics: [
    {
      topic: {
        type: Schema.Types.ObjectId,
        ref: "topics", // Liên kết với đề tài
        required: false,
      },
      registrationDate: {
        type: Date,
        default: Date.now, // Ngày đăng ký đề tài
      },
    },
  ],
});

module.exports = mongoose.model("studentgroups", StudentGroupSchema);
