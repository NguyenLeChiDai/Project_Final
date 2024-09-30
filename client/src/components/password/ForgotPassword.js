import React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import AlertMessage from "../layout/AlertMessage";
import "../../css/LoginForm.css";
import "font-awesome/css/font-awesome.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket } from "@fortawesome/free-solid-svg-icons";
import { faLock } from "@fortawesome/free-solid-svg-icons";
function LoginForm() {
  // Context
  const { loginUser } = useContext(AuthContext);
  //Router
  const navigate = useNavigate();

  // Local state
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [alert, setAlert] = useState(null);

  const { username, password } = loginForm;

  const onChangeLoginForm = (event) =>
    setLoginForm({ ...loginForm, [event.target.name]: event.target.value });

  const login = async (event) => {
    event.preventDefault();

    try {
      const loginData = await loginUser(loginForm);
      console.log(loginData); // Kiểm tra kết quả trả về của loginUser
      if (loginData.success) {
        console.log("Đăng nhập thành công");
        // navigate("/dashboard");
      } else {
        setAlert({ type: "danger", message: loginData.message });
        setTimeout(() => setAlert(null), 5000); //set thời gian cho thông báo đăng nhập
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <Form onSubmit={login}>
          <AlertMessage info={alert} />

          <Form.Group className="form-group">
            <h6>
              <FontAwesomeIcon
                icon={faRightToBracket}
                style={{ marginRight: "8px" }} // Tùy chỉnh style nếu cần
              />
              Tên đăng nhập
            </h6>
            <Form.Control
              type="text"
              placeholder="Tên đăng nhập"
              name="username"
              required
              value={username}
              onChange={onChangeLoginForm}
            />
          </Form.Group>
          <Form.Group className="form-group">
            <h6>
              <FontAwesomeIcon
                icon={faLock}
                style={{
                  marginRight: "10px",
                  fontSize: "1.0rem", // Điều chỉnh kích thước icon tại đây
                }}
              />
              Mật khẩu
            </h6>
            <Form.Control
              type="password"
              placeholder="Mật khẩu"
              name="password"
              required
              value={password}
              onChange={onChangeLoginForm}
            />
          </Form.Group>
          <Button className="btn-login" type="submit">
            Lấy lại mật khẩu
          </Button>
        </Form>

        <p className="forgotpassword-link">
          Bạn đã có tài khoản?
          <Link to="/forgotpassword">
            <Button className="btn-register">Đăng nhập</Button>
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginForm;