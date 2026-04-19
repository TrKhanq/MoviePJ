import { movies as moviesData } from "./models/movies.js";

/* ===================== FUNCTIONS ===================== */

// Label trạng thái
function getStatusLabel(status) {
    return status === 0 ? 'Đã chiếu'
        : status === 1 ? 'Đang chiếu'
        : status === 2 ? 'Sắp chiếu'
        : 'Không xác định';
}

// Class trạng thái
function getStatusClass(status) {
    return status === 0 ? 'ended'
        : status === 1 ? 'showing'
        : status === 2 ? 'coming'
        : '';
}

// Mở modal
function openModal(title = 'Thêm Phim Mới', movieId = null) {
    modalTitle.textContent = title;
    editingMovieId = movieId;

    if (movieId) {
        const movie = movies.find(m => m.id === movieId);
        if (!movie) return;

        movieTitle.value = movie.title;
        movieGenres.value = movie.genres;
        movieDuration.value = movie.duration;
        movieReleaseDate.value = movie.releaseDate;
        movieStatus.value = movie.status;
        movieTicketPrice.value = movie.ticketPrice;
        moviePosterUrl.value = movie.posterUrl;
        movieDescription.value = movie.description;
    } else {
        movieForm.reset();
    }

    movieModal.classList.add('show');
}

// Đóng modal
function closeModal() {
    movieModal.classList.remove('show');
    movieForm.reset();
    clearMovieFormErrors();
    editingMovieId = null;
}

function openDeleteConfirmModal(movie) {
    if (!movie) return;
    pendingDeleteMovieId = movie.id;
    deleteMessage.textContent = `Bạn có chắc chắn muốn xóa phim "${movie.title}" không? Hành động này không thể hoàn tác.`;
    deleteConfirmModal.classList.add('show');
}

// Đóng modal xác nhận xóa và reset trạng thái chờ xóa.
function closeDeleteConfirmModal() {
    pendingDeleteMovieId = null;
    deleteConfirmModal.classList.remove('show');
}

// Xóa toàn bộ thông báo lỗi đang hiển thị trong form phim.
function clearMovieFormErrors() {
    movieForm.querySelectorAll('.field-error-message').forEach((errorElement) => {
        errorElement.textContent = '';
    });
}

// Submit form
// Validate và lưu phim mới/chỉnh sửa vào localStorage.
function handleFormSubmit() {
    clearMovieFormErrors();
    // Validate rỗng từng ô và render span đỏ dưới ô tương ứng.
    let hasError = false;

    function setError(field, message) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return;
        let errorElement = formGroup.querySelector('.field-error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'field-error-message';
            errorElement.style.display = 'block';
            errorElement.style.marginTop = '6px';
            errorElement.style.fontSize = '13px';
            errorElement.style.color = '#dc2626';
            formGroup.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    if (movieTitle.value.trim() === "") {
        hasError = true;
        setError(movieTitle, 'Tên phim không được để trống.');
    }
    if (movieGenres.value.trim() === "") {
        hasError = true;
        setError(movieGenres, 'Thể loại không được để trống.');
    }
    if (movieDuration.value.trim() === "") {
        hasError = true;
        setError(movieDuration, 'Thời lượng không được để trống.');
    }
    if (movieReleaseDate.value.trim() === "") {
        hasError = true;
        setError(movieReleaseDate, 'Ngày khởi chiếu không được để trống.');
    }
    if (movieDescription.value.trim() === "") {
        hasError = true;
        setError(movieDescription, 'Mô tả ngắn không được để trống.');
    }
    if (movieStatus.value.trim() === "") {
        hasError = true;
        setError(movieStatus, 'Trạng thái không được để trống.');
    }
    if (movieTicketPrice.value.trim() === "") {
        hasError = true;
        setError(movieTicketPrice, 'Giá vé không được để trống.');
    }
    if (+movieTicketPrice.value <= 10000){
        hasError = true;
        setError(movieTicketPrice, 'Giá vé không được bé hơn 10.000 đồng');
    }

    if (hasError) return;

    const newMovie = {
        id: editingMovieId || Math.max(0, ...movies.map(m => m.id)) + 1, //tìm ra id lớn nhất rồi +1, nếu không có phim nào thì bắt đầu từ 1
        title: movieTitle.value.trim(),
        genres: movieGenres.value.trim(),
        duration: +movieDuration.value,
        releaseDate: movieReleaseDate.value,
        status: +movieStatus.value,
        ticketPrice: +movieTicketPrice.value, // luôn ép sang kiểu số
        posterUrl: moviePosterUrl.value.trim(),
        description: movieDescription.value.trim()
    };

    if (editingMovieId) {
        const index = movies.findIndex(m => m.id === editingMovieId);
        if (index !== -1) movies[index] = newMovie;
    } else {
        movies.push(newMovie);
    }

    localStorage.setItem('movies', JSON.stringify(movies));

    updateTabCounts();
    renderMovies(currentFilter);
    closeModal();
}

// Xóa phim
// Xóa phim theo id rồi render lại bảng.
function deleteMovie(id) {
    movies = movies.filter(m => m.id !== id);
    localStorage.setItem('movies', JSON.stringify(movies));

    updateTabCounts();
    renderMovies(currentFilter);
}

// Gắn event edit/delete
// Gắn sự kiện cho các nút sửa/xóa sau mỗi lần render.
function attachActionListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = () => openModal('Cập nhật phim', +btn.dataset.id);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = () => {
            const movie = movies.find(m => m.id === +btn.dataset.id);
            openDeleteConfirmModal(movie);
        };
    });
}

// Pagination
// Render các nút phân trang danh sách phim.
function renderPagination(totalPages) {
    if (totalPages <= 1) {
        pagination.innerHTML = ''; //không cần phân trang
        return;
    }

    let html = `<button class="pagination-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>&lt;</button>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    html += `<button class="pagination-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>&gt;</button>`;

    pagination.innerHTML = html;

    pagination.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.onclick = () => {
            const page = +btn.dataset.page;
            if (page >= 1 && page <= totalPages) {
                currentPage = page;
                renderMovies(currentFilter);
            }
        };
    });
}

// Render movies
// Lọc + tìm kiếm + render bảng phim theo trang hiện tại.
function renderMovies(filter = 'all') {
    let list = [...movies];

    if (filter !== 'all') {
        list = list.filter(m => m.status === +filter);
    }

    if (searchQuery) {
        list = list.filter(m =>
            (m.title || '').toLowerCase().includes(searchQuery) ||
            (m.genres || '').toLowerCase().includes(searchQuery)
        );
    }

    const totalPages = Math.max(1, Math.ceil(list.length / moviesPerPage));
    currentPage = Math.min(currentPage, totalPages);

    const start = (currentPage - 1) * moviesPerPage;
    const pageData = list.slice(start, start + moviesPerPage);

    moviesTbody.innerHTML = pageData.length
        ? pageData.map((m) => {
            return `
            <tr>
                <td>
                    <img src="${m.posterUrl}" class="movie-poster"
                        onerror="this.src='https://via.placeholder.com/50x75?text=No+Image'">
                </td>
                <td class="movie-title">${m.title}</td>
                <td>${m.genres}</td>
                <td>${m.duration} phút</td>
                <td>${m.releaseDate}</td>
                <td>
                    <span class="status-badge ${getStatusClass(m.status)}">
                        ${getStatusLabel(m.status)}
                    </span>
                </td>
                <td>
                    <div class="actions">
                        <button class="action-btn edit-btn" data-id="${m.id}">✏️</button>
                        <button class="action-btn delete-btn" data-id="${m.id}">🗑️</button>
                    </div>
                </td>
            </tr>
        `
        }).join('')
        : `<tr><td colspan="7" class="no-data">Không có dữ liệu</td></tr>`;

    attachActionListeners();
    renderPagination(totalPages);
}

// Update tab
// Cập nhật số lượng phim trên từng tab trạng thái.
function updateTabCounts() {
    tabs[0].textContent = `Tất cả (${movies.length})`;
    tabs[1].textContent = `Đang chiếu (${movies.filter(m => m.status === 1).length})`;
    tabs[2].textContent = `Sắp chiếu (${movies.filter(m => m.status === 2).length})`;
    tabs[3].textContent = `Đã chiếu (${movies.filter(m => m.status === 0).length})`;
}

// Logout
// Đăng xuất tài khoản hiện tại.
function logout() {
    localStorage.removeItem('currentUser');
    location.href = './login.html';
}

// Mở modal xác nhận đăng xuất.
function openLogoutModal() {
    logoutModalOverlay.classList.remove('hidden');
}

// Đóng modal xác nhận đăng xuất.
function closeLogoutModal() {
    logoutModalOverlay.classList.add('hidden');
}

/* ===================== DATA ===================== */

let movies = JSON.parse(localStorage.getItem('movies')) || moviesData;
localStorage.setItem('movies', JSON.stringify(movies));

let currentFilter = 'all';
let currentPage = 1;
let editingMovieId = null;
let pendingDeleteMovieId = null;
let searchQuery = '';
const moviesPerPage = 5;

/* ===================== DOM ===================== */

const moviesTbody = document.getElementById('movies-tbody');
const tabs = document.querySelectorAll('.tab-btn');
const addBtn = document.querySelector('.btn-add-movie');
const movieModal = document.getElementById('movieModal');
const movieForm = document.getElementById('movieForm');
const modalTitle = document.getElementById('modalTitle');

const movieTitle = document.getElementById('movieTitle');
const movieGenres = document.getElementById('movieGenres');
const movieDuration = document.getElementById('movieDuration');
const movieReleaseDate = document.getElementById('movieReleaseDate');
const movieStatus = document.getElementById('movieStatus');
const movieTicketPrice = document.getElementById('movieTicketPrice');
const moviePosterUrl = document.getElementById('moviePosterUrl');
const movieDescription = document.getElementById('movieDescription');

const pagination = document.querySelector('.pagination');
const searchInput = document.getElementById('movieSearchInput');
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const deleteMessage = document.getElementById('deleteMessage');
const btnCancelDelete = document.querySelector('.btn-cancel-delete');
const btnConfirmDelete = document.querySelector('.btn-confirm-delete');

const btnCancel = document.querySelector('.btn-cancel');
const modalClose = document.querySelector('.modal-close');
const logoutBtn = document.getElementById('logoutBtn');
const logoutModalOverlay = document.getElementById('logout-modal-overlay');
const logoutModalClose = document.getElementById('logout-modal-close');
const cancelLogoutBtn = document.getElementById('cancel-logout-btn');
const confirmLogoutBtn = document.getElementById('confirm-logout-btn');

/* ===================== EVENTS ===================== */

// Tabs
tabs.forEach(tab => {
    tab.onclick = () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.dataset.status;
        currentPage = 1;
        renderMovies(currentFilter);
    };
});

// Add
addBtn.onclick = () => openModal();

// Submit
movieForm.onsubmit = e => {
    e.preventDefault();
    handleFormSubmit();
};

// Search
searchInput.oninput = e => {
    searchQuery = e.target.value.toLowerCase();
    currentPage = 1;
    renderMovies(currentFilter);
};

// Close modal
btnCancel.onclick = closeModal;
modalClose.onclick = closeModal;

movieModal.onclick = (e) => {
    if (e.target === movieModal) closeModal();
};

// Logout
logoutBtn.onclick = (e) => {
    e.preventDefault();
    openLogoutModal();
};

logoutModalClose.onclick = closeLogoutModal;
cancelLogoutBtn.onclick = closeLogoutModal;
confirmLogoutBtn.onclick = logout;

logoutModalOverlay.onclick = (e) => {
    if (e.target === logoutModalOverlay) closeLogoutModal();
};

btnConfirmDelete.onclick = () => {
    if (!pendingDeleteMovieId) return;
    deleteMovie(pendingDeleteMovieId);
    closeDeleteConfirmModal();
};

btnCancelDelete.onclick = closeDeleteConfirmModal;

deleteConfirmModal.onclick = (e) => {
    if (e.target === deleteConfirmModal) closeDeleteConfirmModal();
};


/* ===================== INIT ===================== */

updateTabCounts();
renderMovies();