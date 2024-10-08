import React, { useContext, useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import "../../css/UserMenu.css";
import avatar from "../../assets/avatar.png";

const UserMenu = () => {
  const navigate = useNavigate();
  const { authState, logoutUser } = useContext(AuthContext);
  const { user, profile } = authState;

  // State để lưu thông tin profile
  const [currentProfile, setCurrentProfile] = useState(profile);

  useEffect(() => {
    // Cập nhật thông tin profile khi authState thay đổi
    setCurrentProfile(profile);
  }, [profile]); // Thêm profile vào dependency array để lắng nghe sự thay đổi

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const handleChangePassword = () => {
    navigate("/change-password"); // Chuyển hướng đến đúng route đã cấu hình
  };

  return (
    <div className="user-dropdown d-flex align-items-center">
      <img
        src={avatar}
        alt="Avatar"
        className="user-avatar me-2"
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          objectFit: "cover",
          marginTop: "20px",
        }}
      />
      <Dropdown>
        <Dropdown.Toggle
          variant="light"
          id="dropdown-basic"
          className="d-flex flex-column align-items-start"
          style={{ marginTop: "20px" }}
        >
          <span>Chào, {currentProfile?.name || user?.username || "User"}</span>
          <small className="text-muted">{user?.role}</small>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item onClick={handleChangePassword}>
            Cập nhật mật khẩu
          </Dropdown.Item>
          <Dropdown.Item onClick={handleLogout}>Đăng xuất</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default UserMenu;
