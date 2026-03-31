import { users } from "./models/users.js";

// Form Submission Handler
const form = document.querySelector('form');
const fullnameInput = document.getElementById('fullname');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const agreementInput = document.getElementById('agreement');

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

    let isValid = true;
    let errorMsg = '';

    // Validate fullname
    if (!fullname) {
        errorMsg += 'Vui lòng nhập họ và tên\n';
        isValid = false;
    } else if (fullname.length < 3) {
        errorMsg += 'Họ và tên phải có tối thiểu 3 ký tự\n';
        isValid = false;
    }

    // Validate email
    if (!email) {
        errorMsg += 'Vui lòng nhập email\n';
        isValid = false;
    } else if (!emailRegex.test(email)) {
        errorMsg += 'Email không hợp lệ\n';
        isValid = false;
    }

    // Validate password requirements
    if (password.length < minLength) {
        errorMsg += `Mật khẩu phải có tối thiểu ${minLength} ký tự\n`;
        isValid = false;
    }

    if (!hasLetterRegex.test(password)) {
        errorMsg += 'Mật khẩu phải chứa ít nhất 1 chữ cái (a-z)\n';
        isValid = false;
    }

    if (!hasNumberRegex.test(password)) {
        errorMsg += 'Mật khẩu phải chứa ít nhất 1 số (0-9)\n';
        isValid = false;
    }

    if (!specialCharRegex.test(password)) {
        errorMsg += 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*...)\n';
        isValid = false;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        errorMsg += 'Mật khẩu xác nhận không khớp\n';
        isValid = false;
    }

    // Check agreement
    if (!agreed) {
        errorMsg += 'Vui lòng đồng ý với điều khoản sử dụng và chính sách bảo mật';
        isValid = false;
    }

    if (!isValid) {
        e.preventDefault();
        alert(errorMsg);
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
            id: Math.max(...localUsers.map(u => u.id), 0) + 1,
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