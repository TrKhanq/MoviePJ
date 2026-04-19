import { users } from "./models/users.js";

// Lấy danh sách users từ localStorage hoặc mảng model
let localUsers = JSON.parse(localStorage.getItem('users')) || users;

// Lưu lại vào localStorage ngay nếu chưa có để đồng bộ
if (!localStorage.getItem('users')) {
  localStorage.setItem('users', JSON.stringify(users));
}

const form = document.querySelector("form");
const successModalOverlay = document.getElementById('success-modal-overlay');
const successModalClose = document.getElementById('success-modal-close');
const successModalOk = document.getElementById('success-modal-ok');
const failureModalOverlay = document.getElementById('failure-modal-overlay');
const failureModalClose = document.getElementById('failure-modal-close');
const failureModalOk = document.getElementById('failure-modal-ok');
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");

// Điều hướng sau khi đăng nhập thành công theo role.
const redirectAfterLogin = (role) => {
  if (role === "admin") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "index.html";
  }
};

// Mở modal đăng nhập thành công.
const openSuccessModal = (role) => {
  successModalOverlay.classList.remove('hidden');
  successModalClose.onclick = successModalOk.onclick = () => redirectAfterLogin(role);
};

// Mở modal báo đăng nhập thất bại.
const openFailureModal = () => {
  failureModalOverlay.classList.remove('hidden');
  failureModalClose.onclick = failureModalOk.onclick = () => failureModalOverlay.classList.add('hidden');
};

// Hiển thị lỗi dưới đúng ô input.
function showFieldError(inputElement, message) {
  // Mỗi input có một span lỗi riêng (key bằng data-for).
  const fieldContainer = inputElement.closest(".password-input") || inputElement;
  const fieldId = inputElement.id || inputElement.name || "field";
  let errorElement = form.querySelector(`.field-error-message[data-for="${fieldId}"]`);
  if (!errorElement) {
    errorElement = document.createElement("span");
    errorElement.className = "field-error-message";
    errorElement.dataset.for = fieldId;
    errorElement.style.display = "block";
    errorElement.style.marginTop = "6px";
    errorElement.style.fontSize = "13px";
    errorElement.style.color = "#dc2626";
    fieldContainer.insertAdjacentElement("afterend", errorElement);
  }
  errorElement.textContent = message;
}

// Xóa lỗi của ô input tương ứng.
function clearFieldError(inputElement) {
  const fieldId = inputElement.id || inputElement.name || "field";
  const errorElement = form.querySelector(`.field-error-message[data-for="${fieldId}"]`);
  if (errorElement) {
    errorElement.textContent = "";
  }
}

// Kiểm tra các ô bắt buộc của form login.
function validateForm() {
  let isValid = true;
  clearFieldError(emailInput);
  clearFieldError(passwordInput);

  // Chỉ kiểm tra rỗng theo yêu cầu.
  if (emailInput.value.trim() === "") {
    showFieldError(emailInput, "Email không được để trống.");
    isValid = false;
  }
  if (passwordInput.value.trim() === "") {
    showFieldError(passwordInput, "Mật khẩu không được để trống.");
    isValid = false;
  }
  return isValid;
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Kiểm tra form có hợp lệ không
  if (!validateForm()) {
    return;
  }

  const email = emailInput.value;
  const password = passwordInput.value;

  const foundUser = localUsers.find(
    u => u.email === email && u.password === password
  );

  if (!foundUser) {
    openFailureModal();
    return;
  }

  // lấy role
  const role = foundUser.role;
  const isActive = foundUser.isActive;

  if (!isActive) {
    openFailureModal();
    return;
  }

  // lưu user đang đăng nhập
  localStorage.setItem("currentUser", JSON.stringify(foundUser));

  openSuccessModal(role);
});

emailInput?.addEventListener("input", () => clearFieldError(emailInput));
passwordInput?.addEventListener("input", () => clearFieldError(passwordInput));