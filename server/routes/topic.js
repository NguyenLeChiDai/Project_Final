const express = require("express");
const router = express.Router();
const Topic = require("../models/Topic");
const { verifyToken, checkRole } = require("../middleware/auth");
const User = require("../models/User");
const ProfileTeacher = require("../models/ProfileTeacher"); // Import model profile

const StudentGroup = require("../models/StudentGroup");
const ProfileStudent = require("../models/ProfileStudent");

const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");

//Get topicGroup
router.get("/:groupId/topics", verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!groupId) {
      return res
        .status(400)
        .json({ success: false, message: "ID nhóm không hợp lệ" });
    }

    const group = await StudentGroup.findById(groupId);
    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Nhóm không tồn tại" });
    }

    const registeredTopics = await Topic.find({
      "Groups.group": groupId,
    })
      .populate({
        path: "teacher",
        select: "name email",
        model: "profileTeacher",
      })
      .populate({
        path: "user",
        select: "username email",
        model: "users",
      });

    if (registeredTopics.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Nhóm chưa đăng ký đề tài nào" });
    }

    const topics = registeredTopics.map((topic) => {
      const groupRegistration = topic.Groups.find(
        (g) => g.group.toString() === groupId
      );
      return {
        topicId: topic._id,
        nameTopic: topic.nameTopic,
        descriptionTopic: topic.descriptionTopic,
        user: {
          id: topic.user._id,
          username: topic.user.username,
          email: topic.user.email,
        },
        teacher: {
          id: topic.teacher._id,
          fullName: topic.teacher.name,
          email: topic.teacher.email,
        },
        registrationDate: groupRegistration
          ? groupRegistration.registrationDate
          : null,
      };
    });

    res.json({ success: true, groupId: group._id, topics });
  } catch (error) {
    console.error("Server error:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi Server", error: error.message });
  }
});
// Chỉ get những đề tài đã được phê duyệt (dành cho sinh viên)
router.get(
  "/approved-topics-student",
  verifyToken,
  checkRole("Sinh viên"),
  async (req, res) => {
    try {
      const approvedTopics = await Topic.find({
        status: "Đã phê duyệt",
      })
        .populate("teacher", "name")
        .sort({ createdAt: -1 });

      // Thêm thuộc tính "registeredGroupsCount" để đếm số nhóm đã đăng ký cho mỗi đề tài
      const topicsWithGroupCount = approvedTopics.map((topic) => ({
        ...topic._doc,
        registeredGroupsCount: topic.Groups.length,
      }));

      res.json({ success: true, topics: topicsWithGroupCount });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  }
);

// Route để lấy danh sách đề tài của giảng viên
router.get("/teacher-topics", verifyToken, async (req, res) => {
  try {
    // Tìm tất cả các đề tài mà giảng viên đã đăng
    const topics = await Topic.find({ user: req.userId }).populate(
      "teacher",
      "name"
    );

    // Kiểm tra nếu không tìm thấy đề tài nào
    if (topics.length === 0) {
      return res.json({
        success: true,
        topics: [],
        message: "Không có đề tài nào được tìm thấy.",
      });
    }

    // Format lại thông tin của từng đề tài với trạng thái phê duyệt
    const formattedTopics = topics.map((topic) => ({
      _id: topic._id, // Giữ lại id
      nameTopic: topic.nameTopic, // Tên đề tài
      descriptionTopic: topic.descriptionTopic, // Mô tả đề tài
      teacher: topic.teacher, // Thông tin giảng viên
      status: topic.status, // Trạng thái phê duyệt
      // Bạn có thể thêm các trường khác nếu cần
    }));

    res.json({
      success: true,
      topics: formattedTopics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đề tài",
      error: error.message,
    });
  }
});

// Route để lấy danh sách đề tài
router.get("/get-topic", verifyToken, async (req, res) => {
  try {
    // Tìm tất cả các đề tài mà giảng viên đã đăng
    const topics = await Topic.find({ user: req.userId }).populate(
      "teacher",
      "name"
    );

    res.json({
      success: true,
      topics: topics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đề tài",
      error: error.message,
    });
  }
});

//Get all topic
router.get("/get-all-topics", verifyToken, async (req, res) => {
  try {
    // Lấy tất cả các đề tài và populate thông tin giảng viên
    const topics = await Topic.find()
      .populate("teacher", "name email")
      .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo mới nhất

    // Thêm thuộc tính "registeredGroupsCount" để đếm số nhóm đã đăng ký cho mỗi đề tài
    const topicsWithGroupCount = topics.map((topic) => {
      return {
        ...topic._doc,
        registeredGroupsCount: topic.Groups.length, // Đếm số lượng nhóm đã đăng ký
      };
    });

    res.json({
      success: true,
      topics: topicsWithGroupCount,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đề tài:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đề tài",
      error: error.message,
    });
  }
});
// Route để đăng tải đề tài
router.post("/post", verifyToken, async (req, res) => {
  const { topicId, nameTopic, descriptionTopic } = req.body;

  // Kiểm tra và xử lý dữ liệu đầu vào
  if (!nameTopic) {
    return res.status(400).json({
      success: false,
      message: "Thiếu tên đề tài",
    });
  }

  try {
    // Kiểm tra xem tên đề tài đã tồn tại cho giảng viên này chưa
    const existingTopic = await Topic.findOne({ nameTopic, user: req.userId });
    if (existingTopic) {
      return res.status(400).json({
        success: false,
        message: "Tên đề tài đã tồn tại cho giảng viên này",
      });
    }

    // Lấy ObjectId của giảng viên từ collection profileTeacher
    const teacher = await ProfileTeacher.findOne({ user: req.userId });
    if (!teacher) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy giảng viên",
      });
    }

    // Tạo mới đề tài
    const newTopic = new Topic({
      topicId,
      nameTopic,
      descriptionTopic,
      user: req.userId,
      teacher: teacher._id,
      status: "Chưa phê duyệt", // Thêm trường status với giá trị mặc định là "pending"
    });

    // Lưu đề tài vào cơ sở dữ liệu
    await newTopic.save();

    // Populate thông tin giảng viên sau khi đã lưu
    const populatedTopic = await Topic.findById(newTopic._id).populate(
      "teacher",
      "name"
    );

    res.json({
      success: true,
      message: "Thêm đề tài thành công",
      topic: populatedTopic,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm đề tài",
      error: error.message,
    });
  }
});

// Route để tìm kiếm đề tài theo tên
router.get("/search", verifyToken, async (req, res) => {
  const { nameTopic } = req.query;

  if (!nameTopic) {
    return res.status(400).json({
      success: false,
      message: "Tên đề tài không được bỏ trống",
    });
  }

  try {
    const topics = await Topic.find({
      nameTopic: { $regex: nameTopic, $options: "i" }, // Tìm kiếm không phân biệt chữ hoa chữ thường
      user: req.userId, // Tìm kiếm theo người dùng hiện tại
    });

    res.json({
      success: true,
      topics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi tìm kiếm đề tài",
      error: error.message,
    });
  }
});
// Route để cập nhật đề tài theo ID
router.put("/update/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { nameTopic, descriptionTopic } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!nameTopic || !descriptionTopic) {
    return res.status(400).json({
      success: false,
      message: "Tên đề tài và mô tả không được bỏ trống",
    });
  }

  try {
    // Tìm đề tài theo ID và thuộc về người dùng hiện tại (giảng viên)
    let topic = await Topic.findOne({ _id: id, user: req.userId });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đề tài hoặc bạn không có quyền sửa đề tài này",
      });
    }

    // Cập nhật thông tin đề tài
    topic.nameTopic = nameTopic;
    topic.descriptionTopic = descriptionTopic;

    // Lưu thay đổi vào database
    await topic.save();

    res.json({
      success: true,
      message: "Cập nhật đề tài thành công",
      topic, // Trả về thông tin đề tài đã cập nhật
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật đề tài",
      error: error.message,
    });
  }
});
// Route để xóa đề tài dựa theo ID
router.delete("/delete/:id", verifyToken, async (req, res) => {
  const { id } = req.params; // Lấy ID của đề tài từ params

  try {
    // Kiểm tra xem đề tài có tồn tại và thuộc về người dùng hiện tại hay không
    const topic = await Topic.findOne({ _id: id, user: req.userId });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Đề tài không tồn tại hoặc bạn không có quyền xóa đề tài này",
      });
    }

    // Xóa đề tài
    await Topic.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Xóa đề tài thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa đề tài",
      error: error.message,
    });
  }
});

router.get("/topic-teacher", async (req, res) => {
  try {
    const topics = await Topic.find().populate({
      path: "teacher",
      model: "profileTeacher", // Model giảng viên
      select: "name", // Chỉ lấy trường 'name'
    });

    res.status(200).json({
      success: true,
      topics, // Trả về các topic cùng với tên giảng viên và tên user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message, // Trả về lỗi nếu có
    });
  }
});
// Đường dẫn đến thư mục uploads
const uploadsDir = path.join(__dirname, "uploads");

// Kiểm tra xem thư mục uploads có tồn tại không, nếu không thì tạo
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true }); // Tạo thư mục và bất kỳ thư mục cha nào nếu cần
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Sử dụng đường dẫn thư mục uploads đã được tạo
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Tên file unique
  },
});

const upload = multer({ storage: storage });

// Upload Topic Excel
router.post(
  "/upload-excel",
  verifyToken,
  upload.single("excelFile"),
  async (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Không có file được tải lên" });
    }

    const { filename, path: filePath } = req.file;

    try {
      // Đọc file Excel
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = xlsx.utils.sheet_to_json(worksheet);

      // Mảng để lưu các đề tài đã tạo
      const createdTopics = [];
      const duplicateTopics = [];

      // Lặp qua từng hàng trong dữ liệu Excel
      for (const row of excelData) {
        // Tìm ObjectId của giáo viên dựa trên teacherId
        const teacher = await ProfileTeacher.findOne({
          teacherId: row.teacherId || req.teacherId,
        });

        if (!teacher) {
          return res.status(400).json({
            success: false,
            message: `Không tìm thấy giáo viên với teacherId: ${
              row.teacherId || req.teacherId
            }`,
          });
        }

        // Kiểm tra nếu trùng nameTopic
        const existingTopic = await Topic.findOne({ nameTopic: row.nameTopic });

        if (existingTopic) {
          // Nếu trùng, thêm vào danh sách duplicate và tiếp tục lặp
          duplicateTopics.push({
            nameTopic: row.nameTopic,
            reason: "Trùng nameTopic",
          });
          continue;
        }

        const newTopic = new Topic({
          nameTopic: row.nameTopic,
          descriptionTopic: row.descriptionTopic,
          user: req.userId, // Giả sử req.userId được set bởi middleware xác thực
          teacher: teacher._id, // Gán ObjectId của giáo viên từ kết quả truy vấn
          status: "Chưa phê duyệt", // Thêm trạng thái mặc định cho đề tài
        });

        // Lưu đề tài vào cơ sở dữ liệu
        const savedTopic = await newTopic.save();
        createdTopics.push(savedTopic); // Đẩy đề tài đã lưu vào mảng createdTopics
      }

      // Trả về kết quả
      res.json({
        success: true,
        message: `Đã tạo thành công ${createdTopics.length} đề tài từ file Excel`,
        topics: createdTopics,
        duplicates: duplicateTopics.length > 0 ? duplicateTopics : null, // Trả về thông tin trùng nếu có
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi xử lý file Excel và tạo đề tài",
        error: error.message,
      });
    }
  }
);

// Đăng ký đề tài cho nhóm
router.post("/register-topic", verifyToken, async (req, res) => {
  const { groupId, topicId } = req.body;

  try {
    // Tìm nhóm và đề tài theo ID
    const group = await StudentGroup.findById(groupId);
    const topic = await Topic.findById(topicId);

    if (!group || !topic) {
      return res
        .status(404)
        .json({ success: false, message: "Nhóm hoặc đề tài không tồn tại" });
    }

    // Kiểm tra xem nhóm có đủ 2 thành viên chưa
    if (group.profileStudents.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Nhóm phải có đủ 2 thành viên mới được đăng ký đề tài",
      });
    }

    // Kiểm tra xem nhóm đã đăng ký bất kỳ đề tài nào chưa
    const existingRegistration = await Topic.findOne({
      "Groups.group": groupId,
    });
    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: "Nhóm đã đăng ký một đề tài khác. Không thể đăng ký thêm.",
      });
    }

    // Kiểm tra xem nhóm đã đăng ký đề tài này chưa
    const alreadyRegistered = topic.Groups.some(
      (g) => g.group.toString() === groupId
    );
    if (alreadyRegistered) {
      return res
        .status(400)
        .json({ success: false, message: "Nhóm đã đăng ký đề tài này" });
    }

    // Thêm groupId vào danh sách nhóm của đề tài
    topic.Groups.push({ group: group._id });
    await topic.save();

    res.json({ success: true, message: "Đăng ký đề tài thành công", topic });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi Server", error: error.message });
  }
});

// Xóa nhóm ra khỏi đề tài đã đăng ký
router.delete("/leave-topic", verifyToken, async (req, res) => {
  const { groupId, topicId } = req.body;

  try {
    // Tìm nhóm và đề tài theo ID
    const group = await StudentGroup.findById(groupId);
    const topic = await Topic.findById(topicId);

    if (!group || !topic) {
      return res
        .status(404)
        .json({ success: false, message: "Nhóm hoặc đề tài không tồn tại" });
    }

    // Tìm thông tin của sinh viên dựa trên userId từ token
    const studentProfile = await ProfileStudent.findOne({ user: req.userId });
    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thông tin sinh viên",
      });
    }

    // Kiểm tra xem người dùng hiện tại có phải là nhóm trưởng không
    const studentInGroup = group.profileStudents.find(
      (s) => s.student.toString() === studentProfile._id.toString()
    );
    if (!studentInGroup || studentInGroup.role !== "Nhóm trưởng") {
      return res.status(403).json({
        success: false,
        message: "Chỉ nhóm trưởng mới được phép rời khỏi đề tài đã đăng ký",
      });
    }

    // Kiểm tra xem nhóm có trong danh sách Groups của đề tài không
    const groupIndex = topic.Groups.findIndex(
      (g) => g.group.toString() === groupId
    );
    if (groupIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Nhóm này không đăng ký đề tài",
      });
    }

    // Xóa nhóm khỏi danh sách Groups của đề tài
    topic.Groups.splice(groupIndex, 1);
    await topic.save();

    res.json({
      success: true,
      message: "Nhóm đã được xóa khỏi đề tài thành công",
      topic,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi Server", error: error.message });
  }
});

// Duyệt đề tài của Admin
router.put(
  "/approve/:topicId",
  verifyToken,
  checkRole("admin"),
  async (req, res) => {
    try {
      const { topicId } = req.params;
      const { status } = req.body; // 'approved' hoặc 'rejected'

      if (!["Đã phê duyệt", "Chưa phê duyệt", "Từ chối"].includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Trạng thái không hợp lệ" });
      }

      const updatedTopic = await Topic.findByIdAndUpdate(
        topicId,
        { status },
        { new: true }
      );

      if (!updatedTopic) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy đề tài" });
      }

      res.json({
        success: true,
        message: `Đề tài đã được ${
          status === "approved" ? "duyệt" : "từ chối"
        }`,
        topic: updatedTopic,
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Lỗi server", error: error.message });
    }
  }
);

module.exports = router;
