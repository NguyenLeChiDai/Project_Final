import React from "react";
import "../css/TrangChu.css";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo-iuh.jpg";
import logo2 from "../assets/cntt-iuh.jpg";
function TrangChu() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login"); // Chuyển hướng đến trang login
  };
  return (
    <div className="trang-chu">
      <header className="header">
        <div className="logo">
          <img src={logo} alt="Logo Trường Đại Học Công Nghiệp TP.HCM" />
        </div>
        <nav className="navbar">
          <ul>
            <li>
              <a href="#">KHÓA LUẬN TỐT NGHIỆP</a>
            </li>
            <li>
              <a href="#">LỊCH KHÓA LUẬN</a>
            </li>
            <li>
              <a href="#">ĐĂNG KÝ KHÓA LUẬN</a>
            </li>
            <li>
              <a href="#">THÔNG TIN</a>
            </li>
          </ul>
        </nav>
        <div className="login-btn">
          <button onClick={handleLoginClick}>ĐĂNG NHẬP</button>{" "}
          {/* Thêm sự kiện onClick */}
        </div>
      </header>

      <section className="gioi-thieu">
        <div className="gioi-thieu-content">
          <h2>
            Giới thiệu Website Quản Lý Khóa Luận Tốt Nghiệp tại Trường Đại học
            Công Nghiệp TP.HCM
          </h2>

          <p>
            Phần mềm quản lý khóa luận tốt nghiệp khoa Công nghệ Thông tin IUH
            là giải pháp toàn diện giúp các sinh viên và giảng viên quản lý và
            theo dõi quá trình thực hiện khóa luận một cách hiệu quả. Với giao
            diện thân thiện và dễ sử dụng, phần mềm này giúp người dùng dễ dàng
            tạo, cập nhật và quản lý thông tin khóa luận chỉ với vài thao tác
            đơn giản.
          </p>
          <ul>
            <li>Tăng cường hiệu quả quản lý và theo dõi</li>
            <li>Hỗ trợ nâng cao chất lượng khóa luận</li>
            <li>Bảo mật thông tin và dễ dàng truy cập tài liệu</li>
          </ul>
        </div>
        <div className="gioi-thieu-image">
          <img
            src={logo2}
            alt="Khoa Công Nghệ Thong Tin Trường Đại Học Công Nghiệp TP.HCM"
          />
        </div>
      </section>
    </div>
  );
}

export default TrangChu;
