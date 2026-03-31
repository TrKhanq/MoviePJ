import { users } from "./models/users.js";

// Lấy danh sách users từ localStorage hoặc mảng model
let localUsers = JSON.parse(localStorage.getItem('users')) || users;

// Lưu lại vào localStorage ngay nếu chưa có để đồng bộ
if (!localStorage.getItem('users')) {
  localStorage.setItem('users', JSON.stringify(users));
}

const form = document.querySelector("form");

// Hàm kiểm tra các trường đã được nhập hay chưa
function validateForm() {
  const email = document.querySelector("#email").value.trim();
  const password = document.querySelector("#password").value.trim();

  if (email === "") {
    alert("Vui lòng nhập email");
    return false;
  }
  if (password === "") {
    alert("Vui lòng nhập mật khẩu");
    return false;
  }
  return true;
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Kiểm tra form có hợp lệ không
  if (!validateForm()) {
    return;
  }

  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  const foundUser = localUsers.find(
    u => u.email === email && u.password === password
  );

  if (!foundUser) {
    alert("Sai email hoặc mật khẩu");
    return;
  }

  // lấy role
  const role = foundUser.role;

  // lưu user đang đăng nhập
  localStorage.setItem("currentUser", JSON.stringify(foundUser));

  alert("Đăng nhập thành công");

  if (role === "admin") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "index.html";
  }
});