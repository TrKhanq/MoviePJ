import { users } from "./models/users.js";

// Form Submission Handler
const form = document.querySelector('form');
const fullnameInput = document.getElementById('fullname');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const agreementInput = document.getElementById('agreement');

// Hiển thị lỗi cho đúng field bằng span đỏ.
function showFieldError(element, message) {
    // Đặt span lỗi ngay sau control tương ứng để không lệch layout.
    const container = element.closest('.password-input') || element.closest('.form-agreement') || element;
    const fieldId = element.id || element.name || 'field';
    let errorElement = form.querySelector(`.field-error-message[data-for="${fieldId}"]`);
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'field-error-message';
        errorElement.dataset.for = fieldId;
        errorElement.style.display = 'block';
        errorElement.style.marginTop = '6px';
        errorElement.style.fontSize = '13px';
        errorElement.style.color = '#dc2626';
        container.insertAdjacentElement('afterend', errorElement);
    }
    errorElement.textContent = message;
}

// Xóa lỗi đang hiển thị của field.
function clearFieldError(element) {
    const fieldId = element.id || element.name || 'field';
    const errorElement = form.querySelector(`.field-error-message[data-for="${fieldId}"]`);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

form.addEventListener('submit', function (e) {
    const fullname = fullnameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const agreed = agreementInput.checked;

    const minLength = 8;
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    const hasNumberRegex = /[0-9]/;
    const hasLetterRegex = /[a-zA-Z]/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Reset lỗi cũ trước khi validate lượt mới.
    let isValid = true;
    [fullnameInput, emailInput, passwordInput, confirmPasswordInput, agreementInput].forEach(clearFieldError);

    // Validate fullname
    if (!fullname) {
        showFieldError(fullnameInput, 'Họ và tên không được để trống.');
        isValid = false;
    } else if (fullname.length < 3) {
        showFieldError(fullnameInput, 'Họ và tên phải có tối thiểu 3 ký tự.');
        isValid = false;
    }

    // Validate email
    if (!email) {
        showFieldError(emailInput, 'Email không được để trống.');
        isValid = false;
    } else if (!emailRegex.test(email)) { //boolean
        showFieldError(emailInput, 'Email không hợp lệ.');
        isValid = false;
    }

    // Validate password requirements
    if (!password) {
        showFieldError(passwordInput, 'Mật khẩu không được để trống.');
        isValid = false;
    } else if (password.length < minLength) {
        showFieldError(passwordInput, `Mật khẩu phải có tối thiểu ${minLength} ký tự.`);
        isValid = false;
    } else if (!hasLetterRegex.test(password)) {
        showFieldError(passwordInput, 'Mật khẩu phải chứa ít nhất 1 chữ cái (a-z).');
        isValid = false;
    } else if (!hasNumberRegex.test(password)) {
        showFieldError(passwordInput, 'Mật khẩu phải chứa ít nhất 1 số (0-9).');
        isValid = false;
    } else if (!specialCharRegex.test(password)) {
        showFieldError(passwordInput, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt.');
        isValid = false;
    }

    // Check if passwords match
    if (!confirmPassword) {
        showFieldError(confirmPasswordInput, 'Xác nhận mật khẩu không được để trống.');
        isValid = false;
    } else if (password !== confirmPassword) {
        showFieldError(confirmPasswordInput, 'Mật khẩu xác nhận không khớp.');
        isValid = false;
    }

    // Check agreement
    if (!agreed) {
        showFieldError(agreementInput, 'Vui lòng đồng ý với điều khoản sử dụng và chính sách bảo mật.');
        isValid = false;
    }

    if (!isValid) {
        e.preventDefault();
        return;
    } else {
        e.preventDefault();

        // Initialize users from localStorage or default
        let localUsers = JSON.parse(localStorage.getItem('users')) || users;

        // Check if email already exists
        const emailExists = localUsers.find(u => u.email === email);
        if (emailExists) {
            alert('Email này đã được sử dụng!');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            fullName: fullname,
            email: email,
            password: password,
            role: "user",
            createdAt: new Date().toISOString(),
            isActive: true
        };

        // Add to array and save
        localUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(localUsers));

        alert("Đăng ký thành công!");
        window.location.href = "login.html";
    }
});

[fullnameInput, emailInput, passwordInput, confirmPasswordInput].forEach((inputElement) => {
    inputElement.addEventListener('input', () => clearFieldError(inputElement));
});
agreementInput.addEventListener('change', () => clearFieldError(agreementInput));