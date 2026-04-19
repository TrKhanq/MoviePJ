import { getTickets, setTickets } from "./models/tickets.js";
import { movies } from "./models/movies.js";

let activeFilter = "all";
let currentPage = 1;
let editingTicketId = null;
let pendingDeleteTicketCode = null;

const itemsPerPage = 5;
// Helper DOM
const queryElement = (selector, root = document) => root.querySelector(selector); // Hàm tiện ích để lấy một phần tử DOM, trả về null nếu không tìm thấy.
const queryElements = (selector, root = document) => [...root.querySelectorAll(selector)]; //... convert sang Array

// Kiểm tra vé có khớp tab lọc hiện tại hay không.
function isTicketMatchFilter(ticket) {
  if (activeFilter === "all") return true;
  if (activeFilter === "paid") return ticket.paymentStatus === true;
  if (activeFilter === "pending") return ticket.paymentStatus === false && ticket.statusDisplay !== "Đã hủy";
  if (activeFilter === "cancelled") return ticket.statusDisplay === "Đã hủy";
  return true; //Nếu lỗi filter thì vẫn hiển thị vé thay vì trả về false hết
}

// Render lại toàn bộ khu vực dữ liệu vé.
function refreshUI() {
  renderTicketsTable();
}

// Lấy danh sách vé hiện tại từ storage.
function getAllTickets() {
  return getTickets();
}

// Lấy mã vé từ dòng bảng được click.
function getTicketCodeFromRow(clickedElement) {
  return clickedElement.closest("tr").querySelector(".ticket-code").textContent.replace("#", ""); // Loại bỏ dấu # ở đầu mã vé.
}

// Tìm vé theo ticketCode.
function getTicketByCode(ticketCode) {
  return getAllTickets().find((ticket) => ticket.ticketCode === ticketCode);
}

// Mở modal ở chế độ chỉnh sửa và đổ dữ liệu vé.
function openEditModal(ticket) {
  editingTicketId = ticket.id; // Lưu lại id đang chỉnh sửa để phân biệt với chế độ thêm mới.
  queryElement("#bookingModal")?.classList.remove("hidden");
  queryElement(".modal-header h2").textContent = "Cập nhật thông tin vé";
  queryElement(".btn-submit").textContent = "Lưu thay đổi";
  queryElement("#ticketCodeSection").classList.remove("hidden");
  queryElement("#ticketCodeDisplay").textContent = `#${ticket.ticketCode}`;
  queryElement("#customerName").value = ticket.customerName;
  queryElement("#customerPhone").value = ticket.customerPhone;
  queryElement("#movieId").value = ticket.movieId;
  queryElement("#showTime").value = `${ticket.showDate}T${ticket.showTime}`;
  queryElement("#seats").value = ticket.seats.join(", ");
  queryElement("#paymentMethod").value = ticket.paymentMethod;
  queryElement("#paymentStatus").value = ticket.paymentStatus ? "true" : "false";
  queryElement("#note").value = ticket.note || "";
  updateTotalPriceDisplay();
}

// Render bảng vé theo filter và phân trang hiện tại.
function renderTicketsTable() {
  const allTickets = getAllTickets();
  const filteredTickets = allTickets.filter(isTicketMatchFilter);
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / itemsPerPage));
  const currentPageItems = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  queryElement(".tickets-table tbody").innerHTML = currentPageItems
    .map(
      (ticket) => `<tr>
        <td class="ticket-code">#${ticket.ticketCode}</td>
        <td><div class="customer-name">${ticket.customerName}</div><div class="customer-phone">${ticket.customerPhone}</div></td>
        <td>${ticket.movieTitle}</td>
        <td>${ticket.showTime}<br><span class="session-date">${formatDateDisplay(ticket.showDate)}</span></td>
        <td>${ticket.seats.join(", ")}</td>
        <td>${formatCurrencyDisplay(ticket.totalAmount)}</td>
        <td><span class="status-pill ${ticket.statusDisplay === "Đã hủy" ? "cancelled" : ticket.paymentStatus ? "paid" : "pending"}">${ticket.statusDisplay}</span></td>
        <td><button class="action-btn edit" title="Sửa">✎</button><button class="action-btn delete" title="Xóa">✕</button></td>
      </tr>`
    )
    .join("");

  renderPagination(totalPages);
  renderResultsInfo(filteredTickets.length);
  renderDashboardStats(allTickets);
}

// Render cụm nút phân trang bảng vé.
function renderPagination(totalPages) {
  const paginationContainer = queryElement(".pagination");
  paginationContainer.innerHTML = "";

  if (totalPages <= 1) return;

  let paginationHtml = `<button class="pagination-btn" ${currentPage === 1 ? "disabled" : ""}>◀</button>`;
  for (let pageNumber = 1; pageNumber <= Math.min(totalPages, 3); pageNumber += 1) {
    paginationHtml += `<button class="pagination-btn${pageNumber === currentPage ? " active" : ""}">${pageNumber}</button>`;
  }
  if (totalPages > 3) {
    paginationHtml += `<span class="pagination-dots">...</span><button class="pagination-btn">${totalPages}</button>`;
  }
  paginationHtml += `<button class="pagination-btn" ${currentPage === totalPages ? "disabled" : ""}>▶</button>`;
  paginationContainer.innerHTML = paginationHtml;
}

// Hiển thị dòng thông tin số lượng kết quả.
function renderResultsInfo(totalFilteredTickets) {
  const resultsInfoElement = queryElement(".results-info");
  if (!resultsInfoElement) return;

  const startItemIndex = (currentPage - 1) * itemsPerPage + 1;
  const endItemIndex = Math.min(currentPage * itemsPerPage, totalFilteredTickets);
  resultsInfoElement.textContent = `Đang xem ${startItemIndex} đến ${endItemIndex} trong số ${totalFilteredTickets} kết quả`;
}

// Format ngày sang dd/MM/yyyy.
function formatDateDisplay(dateString) {
  const dateObject = new Date(dateString);
  return `${String(dateObject.getDate()).padStart(2, "0")}/${String(dateObject.getMonth() + 1).padStart(2, "0")}/${dateObject.getFullYear()}`;
}

// Format tiền theo định dạng VND.
function formatCurrencyDisplay(amount) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

// Cập nhật các thẻ thống kê trên trang booking.
function renderDashboardStats(allTickets) {
  const dashboardCards = queryElements(".dashboard-card");
  const todayString = new Date().toDateString();

  if (dashboardCards[0]) {
    const todayCount = allTickets.filter((ticket) => new Date(ticket.showDate).toDateString() === todayString).length;
    dashboardCards[0].querySelector(".card-value").textContent = todayCount || allTickets.length;
  }

  if (dashboardCards[1]) {
    const paidTotalAmount = allTickets.filter((ticket) => ticket.paymentStatus).reduce((sum, ticket) => sum + ticket.totalAmount, 0);
    dashboardCards[1].querySelector(".card-value").textContent = `${(paidTotalAmount / 1e6).toFixed(1)}tr`;
  }

  if (dashboardCards[2]) {
    dashboardCards[2].querySelector(".card-value").textContent = allTickets.filter(
      (ticket) => !ticket.paymentStatus && ticket.statusDisplay !== "Đã hủy"
    ).length;
  }

  queryElements(".tab-btn").forEach((tabButton) => {
    const status = tabButton.dataset.status;
    const countByStatus =
      status === "all"
        ? allTickets.length
        : status === "paid"
          ? allTickets.filter((ticket) => ticket.paymentStatus).length
          : status === "pending"
            ? allTickets.filter((ticket) => !ticket.paymentStatus && ticket.statusDisplay !== "Đã hủy").length
            : status === "cancelled"
              ? allTickets.filter((ticket) => ticket.statusDisplay === "Đã hủy").length
              : 0;
    tabButton.textContent = `${tabButton.textContent.split(" (")[0]} (${countByStatus})`;
  });
}

// Đóng modal booking và reset form.
function closeBookingModal() {
  queryElement("#bookingModal")?.classList.add("hidden");
  queryElement("#bookingForm")?.reset();
  queryElement("#bookingForm")?.querySelectorAll(".field-error-message").forEach((errorElement) => {
    errorElement.textContent = "";
  });
}

// Đếm số ghế từ chuỗi input ghế.
function countSelectedSeats() {
  const seatsInputValue = queryElement("#seats")?.value || "";
  const seatsArray = seatsInputValue.split(",").map((seat) => seat.trim()).filter(Boolean);
  return seatsArray.length || 1;
}

// Tính và hiển thị tổng tiền dự kiến.
function updateTotalPriceDisplay() {
  const selectedMovie = movies.find((movie) => movie.id === +queryElement("#movieId").value);
  if (!selectedMovie) return;

  const seatCount = countSelectedSeats();
  queryElement("#totalPrice").textContent = formatCurrencyDisplay(selectedMovie.ticketPrice * seatCount);
  queryElement("#totalNote").textContent = `${seatCount} vé × ${formatCurrencyDisplay(selectedMovie.ticketPrice)}`;
}

// Sinh mã vé dựa trên thời gian hiện tại.
function createTicketCodeByTime() {
  return `VE-${Date.now()}`;
}

// Đăng xuất tài khoản hiện tại.
function logout() {
  localStorage.removeItem("currentUser");
  location.href = "./login.html";
}

// Mở modal xác nhận đăng xuất.
function openLogoutModal() {
  queryElement("#logout-modal-overlay")?.classList.remove("hidden");
}

// Đóng modal xác nhận đăng xuất.
function closeLogoutModal() {
  queryElement("#logout-modal-overlay")?.classList.add("hidden");
}

// Validate form và xử lý thêm/cập nhật vé.
function handleSubmitBookingForm(event) {
  event.preventDefault();

  // Tạo/hiển thị lỗi ngay dưới đúng ô đang validate.
  function setFieldError(fieldId, message) {
    const inputElement = queryElement(fieldId);
    const fieldContainer = inputElement?.closest(".modal-section, .modal-col");
    if (!inputElement || !fieldContainer) return;
    let errorElement = fieldContainer.querySelector(`.field-error-message[data-for="${inputElement.id}"]`);
    if (!errorElement) {
      errorElement = document.createElement("span");
      errorElement.className = "field-error-message";
      errorElement.dataset.for = inputElement.id;
      errorElement.style.display = "block";
      errorElement.style.marginTop = "6px";
      errorElement.style.fontSize = "13px";
      errorElement.style.color = "#dc2626";
      const referenceElement = inputElement.closest(".password-input") || inputElement;
      referenceElement.insertAdjacentElement("afterend", errorElement);
    }
    errorElement.textContent = message;
  }

  queryElement("#bookingForm")?.querySelectorAll(".field-error-message").forEach((errorElement) => {
    errorElement.textContent = "";
  });

  const customerName = queryElement("#customerName").value.trim();
  const customerPhone = queryElement("#customerPhone").value.trim();
  const movieId = queryElement("#movieId").value;
  const showTimeDateValue = queryElement("#showTime").value;
  const paymentMethod = queryElement("#paymentMethod").value;
  const paymentStatusValue = queryElement("#paymentStatus").value;
  const paymentStatus = paymentStatusValue === "true";
  const note = queryElement("#note").value.trim();
  const seatsText = queryElement("#seats").value.trim();

  // Validate bắt buộc: nếu rỗng thì gắn span lỗi và chặn submit.
  let hasError = false;
  if (customerName === "") {
    setFieldError("#customerName", "Tên khách hàng không được để trống.");
    hasError = true;
  }
  if (customerPhone === "") {
    setFieldError("#customerPhone", "Số điện thoại không được để trống.");
    hasError = true;
  }
  if (movieId === "") {
    setFieldError("#movieId", "Phim không được để trống.");
    hasError = true;
  }
  if (showTimeDateValue === "") {
    setFieldError("#showTime", "Suất chiếu không được để trống.");
    hasError = true;
  }
  if (paymentMethod === "") {
    setFieldError("#paymentMethod", "Phương thức thanh toán không được để trống.");
    hasError = true;
  }
  if (paymentStatusValue === "") {
    setFieldError("#paymentStatus", "Trạng thái thanh toán không được để trống.");
    hasError = true;
  }
  if (seatsText === "") {
    setFieldError("#seats", "Ghế đã chọn không được để trống.");
    hasError = true;
  }
  if (hasError) return;

  const selectedMovie = movies.find((movie) => movie.id === +movieId);
  if (!selectedMovie) {
    alert("Dữ liệu không hợp lệ!");
    return;
  }

  const seats = seatsText.split(",").map((seat) => seat.trim()).filter(Boolean);
  const seatCount = seats.length || 1;
  const totalAmount = selectedMovie.ticketPrice * seatCount;

  if (editingTicketId) { // Đang ở chế độ chỉnh sửa, cập nhật vé cũ.
    const patch = {
      customerName,
      customerPhone,
      movieId: selectedMovie.id,
      movieTitle: selectedMovie.title,
      showDate: showTimeDateValue.split("T")[0],
      showTime: showTimeDateValue.split("T")[1],
      seats,
      seatCount,
      pricePerSeat: selectedMovie.ticketPrice,
      totalAmount,
      paymentMethod: +paymentMethod,
      paymentStatus,
      note,
      statusDisplay: paymentStatus ? "Đã Thanh Toán" : "Chờ xử lý",
    };

    const allTickets = getAllTickets();
    const editingIndex = allTickets.findIndex((ticket) => ticket?.id === editingTicketId);
    if (editingIndex !== -1) {
      const updatedTickets = [...allTickets];
      updatedTickets[editingIndex] = { ...updatedTickets[editingIndex], ...patch };
      setTickets(updatedTickets);
    }

    const updatedTicket = getTickets().find((ticket) => ticket.id === editingTicketId);
    alert(`Cập nhật thành công vé ${updatedTicket?.ticketCode || ""}`.trim());
  } else {
    const allTickets = getAllTickets();
    const nextId = Math.max(0, ...allTickets.map((ticket) => ticket.id)) + 1;
    const newTicket = {
      id: nextId,
      ticketCode: createTicketCodeByTime(),
      customerName,
      customerPhone,
      movieId: selectedMovie.id,
      movieTitle: selectedMovie.title,
      showDate: showTimeDateValue.split("T")[0],
      showTime: showTimeDateValue.split("T")[1],
      seats,
      seatCount,
      pricePerSeat: selectedMovie.ticketPrice,
      totalAmount,
      paymentMethod: +paymentMethod,
      paymentStatus,
      createdAt: new Date().toISOString(),
      note,
      statusDisplay: paymentStatus ? "Đã Thanh Toán" : "Chờ xử lý",
    };

    setTickets([newTicket, ...allTickets]);
    alert(`Đặt vé thành công! Mã vé: ${newTicket.ticketCode}`);
  }

  editingTicketId = null;
  closeBookingModal();
  refreshUI();
}

document.addEventListener("DOMContentLoaded", () => {
  refreshUI();

  queryElement("#logoutBtn")?.addEventListener("click", (event) => {
    event.preventDefault();
    openLogoutModal();
  });

  queryElement("#confirm-logout-btn")?.addEventListener("click", logout);
  queryElement("#cancel-logout-btn")?.addEventListener("click", closeLogoutModal);
  queryElement("#logout-modal-close")?.addEventListener("click", closeLogoutModal);
  queryElement("#logout-modal-overlay")?.addEventListener("click", (event) => {
    if (event.target.id === "logout-modal-overlay") {
      closeLogoutModal();
    }
  });

  queryElements(".tab-btn").forEach((button) =>
    button.addEventListener("click", (event) => {
      queryElements(".tab-btn").forEach((tabButton) => tabButton.classList.remove("active"));
      event.target.classList.add("active");
      activeFilter = event.target.dataset.status || "all";
      currentPage = 1;
      refreshUI();
    })
  );

  queryElement(".btn-add-movie")?.addEventListener("click", () => {
    editingTicketId = null;
    queryElement("#bookingModal")?.classList.remove("hidden");
    queryElement(".modal-header h2").textContent = "Thêm Mới Đặt Vé";
    queryElement(".btn-submit").textContent = "Xác nhận đặt vé";
    queryElement("#ticketCodeSection").classList.add("hidden");
    queryElement("#bookingForm")?.reset();
    updateTotalPriceDisplay();
  });

  document.addEventListener("click", (event) => {
    const clickedElement = event.target;
    if (clickedElement.classList.contains("edit")) {
      const ticketCode = getTicketCodeFromRow(clickedElement);
      const ticket = getTicketByCode(ticketCode);
      if (!ticket) return;
      openEditModal(ticket);
    }

    if (clickedElement.classList.contains("delete")) {
      const ticketCode = getTicketCodeFromRow(clickedElement);
      pendingDeleteTicketCode = ticketCode;
      const ticket = getTicketByCode(ticketCode);
      queryElement("#deleteMessage").textContent =
        `Bạn có chắc chắn muốn xóa vé ${ticketCode} của khách hàng ${ticket.customerName} không? Hành động này không thể hoàn tác.`;
      queryElement("#deleteConfirmModal").classList.add("show");
    }

    if (clickedElement.classList.contains("pagination-btn") && clickedElement.textContent !== "...") {
      const selectedPageNumber = parseInt(clickedElement.textContent, 10);
      if (!Number.isNaN(selectedPageNumber)) {
        currentPage = selectedPageNumber;
        refreshUI();
      }
    }
  });

  queryElement(".btn-confirm-delete")?.addEventListener("click", () => {
    if (!pendingDeleteTicketCode) return;

    const updatedTickets = getTickets().filter((ticket) => ticket?.ticketCode !== pendingDeleteTicketCode);
    setTickets(updatedTickets);
    pendingDeleteTicketCode = null;
    queryElement("#deleteConfirmModal").classList.remove("show");
    refreshUI();
  });

  queryElement(".btn-cancel-delete")?.addEventListener("click", () => {
    pendingDeleteTicketCode = null;
    queryElement("#deleteConfirmModal").classList.remove("show");
  });

  queryElement("#deleteConfirmModal")?.addEventListener("click", (event) => {
    if (event.target.id === "deleteConfirmModal") {
      pendingDeleteTicketCode = null;
      queryElement("#deleteConfirmModal").classList.remove("show");
    }
  });

  const bookingModalElement = queryElement("#bookingModal");
  queryElement("#bookingModalClose")?.addEventListener("click", closeBookingModal);
  queryElement("#bookingCancelBtn")?.addEventListener("click", closeBookingModal);
  bookingModalElement?.addEventListener("click", (event) => event.target === bookingModalElement && closeBookingModal());

  queryElement("#bookingForm")?.addEventListener("submit", handleSubmitBookingForm);
  queryElement("#movieId")?.addEventListener("change", updateTotalPriceDisplay);
  queryElement("#seats")?.addEventListener("input", updateTotalPriceDisplay);

  const movieSelectElement = queryElement("#movieId");
  movies.forEach((movie) => {
    const optionElement = document.createElement("option");
    optionElement.value = movie.id;
    optionElement.textContent = movie.title;
    optionElement.dataset.price = movie.ticketPrice;
    movieSelectElement?.appendChild(optionElement);
  });
});
