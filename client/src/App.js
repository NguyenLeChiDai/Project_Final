import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Landing from "./components/layout/Landing";
import TrangChu from "./screen/TrangChu";
import Auth from "./views/Auth";
import AuthContextProvider from "./contexts/AuthContext";
import DashboardAdmin from "./views/DashboardAdmin";
import DashboardUser from "./views/DashboardUser";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import ManageStudentAccounts from "./components/viewsAdmin/ManageStudentAccounts"; // Import AccountManagement
import DashboardTeacher from "./views/DashboardTeacher";
import ManageTeacherAccounts from "./components/viewsAdmin/ManageTeacherAccounts";
import PostTheTopic from "./components/viewTeacher/PostTheTopic";
import { HomeAdmin } from "./components/viewsAdmin/HomeAdmin";
import ManageStudentGroups from "./components/viewsAdmin/ManageStudentGroups";
import { ListStudentGroups } from "./components/user/ListStudentGroups";
import StudentInfo from "./components/user/StudentInfo";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <AuthContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth authRoute="login" />} />
          <Route path="/register" element={<Auth authRoute="register" />} />
          <Route path="/trangchu" element={<TrangChu />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboardAdmin" element={<DashboardAdmin />}>
              <Route index element={<HomeAdmin />} />
              <Route
                path="manage-student-accounts"
                element={<ManageStudentAccounts />}
              />{" "}
              {/* Đường dẫn cho "Quản lý tài khoản sinh viên" */}
              <Route
                path="manage-teacher-accounts"
                element={<ManageStudentAccounts />}
              />{" "}
              {/* Đường dẫn cho "Quản lý tài khoản giảng viên" */}
              <Route
                path="student-groups"
                element={<ManageStudentGroups />}
              />{" "}
              {/* Đường dẫn cho "Nhóm sinh viên" */}
            </Route>

            <Route path="/dashboardUser" element={<DashboardUser />}>
              <Route index element={<StudentInfo />} />{" "}
              <Route
                path="list-student-groups"
                element={<ListStudentGroups />}
              />{" "}
            </Route>
            <Route path="/dashboardTeacher" element={<DashboardTeacher />}>
              <Route path="upload-topic" element={<PostTheTopic />} />
            </Route>
          </Route>
        </Routes>
        <ToastContainer />
      </Router>
    </AuthContextProvider>
  );
}

export default App;
