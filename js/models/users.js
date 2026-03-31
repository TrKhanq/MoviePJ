// example list of users, exported for login module
export const users = [
  {
    id: 1,
    fullName: "Admin Chính",
    email: "LQuan@rikkei.edu.vn",
    password: "Admin123456",
    role: "admin", // "admin" hoặc "user" (VQi Project này chỉ cần tối chi cấp admin)
    createdAt: "2026-03-03T12:26:21.617Z",
    isActive: true // Trong trạng thái hoạt động (true/false)
  },
  {
    id: 2,
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    password: "MatKhau123",
    role: "user",
    createdAt: "2026-03-01T12:26:21.617Z",
    isActive: true
  },
  {
    id: 3,
    fullName: "Trần Thị B",
    email: "tranthib@example.com",
    password: "12345678",
    role: "user",
    createdAt: "2026-03-03T12:26:21.617Z",
    isActive: false
  }
];
