import { movies as moviesData } from "./models/movies.js";

// Mock data - dùng movies từ model
let movies = JSON.parse(localStorage.getItem('movies')) || moviesData;

// Reset localStorage để tải dữ liệu mới
localStorage.removeItem('movies');

// Lưu lại vào localStorage
if (!localStorage.getItem('movies')) {
    localStorage.setItem('movies', JSON.stringify(moviesData));
}

// DOM Elements
let moviesTableBody;
let tabButtons;
let addMovieBtn;
let movieModal;
let movieForm;
let modalTitle;
let modalCloseBtn;
let btnCancel;

let currentFilter = 'all';
let editingMovieId = null;

// Initialize DOM elements when DOM is loaded
function initializeDOM() {
    moviesTableBody = document.getElementById('movies-tbody');
    tabButtons = document.querySelectorAll('.tab-btn');
    addMovieBtn = document.querySelector('.btn-add-movie');
    movieModal = document.getElementById('movieModal');
    movieForm = document.getElementById('movieForm');
    modalTitle = document.getElementById('modalTitle');
    modalCloseBtn = document.querySelector('.modal-close');
    btnCancel = document.querySelector('.btn-cancel');

    // Check if elements exist
    if (!moviesTableBody) {
        console.error('movies-tbody element not found');
        return false;
    }

    // Setup event listeners
    setupEventListeners();

    // Initial render
    updateTabCounts();
    renderMovies('all');

    return true;
}

// Setup event listeners
function setupEventListeners() {
    // Tab buttons
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.status;
            renderMovies(currentFilter);
        });
    });

    // Add movie button
    if (addMovieBtn) {
        addMovieBtn.addEventListener('click', function () {
            openModal('Thêm Phim Mới');
        });
    }

    // Modal close buttons
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }
    if (btnCancel) {
        btnCancel.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside
    if (movieModal) {
        movieModal.addEventListener('click', function (e) {
            if (e.target === movieModal) {
                closeModal();
            }
        });
    }

    // Form submit
    if (movieForm) {
        movieForm.addEventListener('submit', function (e) {
            e.preventDefault();
            handleFormSubmit();
        });
    }

    // Đăng xuất
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
                window.location.href = './login.html';
            }
        });
    }
}

// Hàm render bảng phim
function renderMovies(filter = 'all') {
    if (!moviesTableBody) {
        console.error('moviesTableBody not found');
        return;
    }

    moviesTableBody.innerHTML = '';

    let filteredMovies = movies;
    if (filter !== 'all') {
        filteredMovies = movies.filter(movie => movie.status === parseInt(filter));
    }

    filteredMovies.forEach(movie => {
        const statusLabel = getStatusLabel(movie.status);
        const statusClass = getStatusClass(movie.status);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${movie.posterUrl}" alt="${movie.title}" class="movie-poster" onerror="this.src='https://via.placeholder.com/50x75?text=No+Image'"></td>
            <td class="movie-title">${movie.titleVi || movie.title}</td>
            <td>${movie.genres}</td>
            <td>${movie.duration} phút</td>
            <td>${movie.releaseDate}</td>
            <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
            <td>
                <div class="actions">
                    <button class="action-btn edit-btn" data-id="${movie.id}" title="Chỉnh sửa">✏️</button>
                    <button class="action-btn delete-btn" data-id="${movie.id}" title="Xóa">🗑️</button>
                </div>
            </td>
        `;
        moviesTableBody.appendChild(row);
    });

    // Attach event listeners cho edit và delete buttons
    attachActionListeners();
}

// Handle form submit
function handleFormSubmit() {
    const newMovie = {
        id: editingMovieId || Math.max(...movies.map(m => m.id), 0) + 1,
        title: document.getElementById('movieTitle').value,
        genres: document.getElementById('movieGenres').value,
        duration: parseInt(document.getElementById('movieDuration').value),
        releaseDate: document.getElementById('movieReleaseDate').value,
        status: parseInt(document.getElementById('movieStatus').value),
        ticketPrice: parseInt(document.getElementById('movieTicketPrice').value),
        posterUrl: document.getElementById('moviePosterUrl').value,
        description: document.getElementById('movieDescription').value
    };

    if (editingMovieId) {
        // Cập nhật phim
        const index = movies.findIndex(m => m.id === editingMovieId);
        if (index !== -1) {
            movies[index] = newMovie;
        }
    } else {
        // Thêm phim mới
        movies.push(newMovie);
    }

    // Lưu vào localStorage
    localStorage.setItem('movies', JSON.stringify(movies));

    // Cập nhật giao diện
    updateTabCounts();
    renderMovies(currentFilter);
    closeModal();
}

// Hàm lấy nhãn trạng thái
function getStatusLabel(status) {
    switch (status) {
        case 0: return 'Đã chiếu';
        case 1: return 'Đang chiếu';
        case 2: return 'Sắp chiếu';
        default: return 'Không xác định';
    }
}

// Hàm lấy class CSS cho trạng thái
function getStatusClass(status) {
    switch (status) {
        case 0: return 'ended';
        case 1: return 'showing';
        case 2: return 'coming';
        default: return '';
    }
}

// Hàm mở modal
function openModal(title = 'Thêm Phim Mới', movieId = null) {
    if (!modalTitle || !movieForm) return;

    modalTitle.textContent = title;
    editingMovieId = movieId;

    if (movieId) {
        // Nếu edit, điền dữ liệu phim
        const movie = movies.find(m => m.id === movieId);
        if (movie) {
            document.getElementById('movieTitle').value = movie.title;
            document.getElementById('movieGenres').value = movie.genres;
            document.getElementById('movieDuration').value = movie.duration;
            document.getElementById('movieReleaseDate').value = movie.releaseDate;
            document.getElementById('movieStatus').value = movie.status;
            document.getElementById('movieTicketPrice').value = movie.ticketPrice;
            document.getElementById('moviePosterUrl').value = movie.posterUrl;
            document.getElementById('movieDescription').value = movie.description;
        }
    } else {
        // Nếu thêm, xóa form
        movieForm.reset();
    }

    if (movieModal) {
        movieModal.classList.add('show');
    }
}

// Hàm đóng modal
function closeModal() {
    if (movieModal) {
        movieModal.classList.remove('show');
    }
    if (movieForm) {
        movieForm.reset();
    }
    editingMovieId = null;
}

// Hàm xóa phim
function deleteMovie(movieId) {
    if (confirm('Bạn có chắc chắn muốn xóa bộ phim này?')) {
        movies = movies.filter(m => m.id !== movieId);
        localStorage.setItem('movies', JSON.stringify(movies));
        updateTabCounts();
        renderMovies(currentFilter);
    }
}

// Attach event listeners cho edit và delete buttons
function attachActionListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const movieId = parseInt(this.dataset.id);
            openModal('Cập Nhật Thông Tin Phim', movieId);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const movieId = parseInt(this.dataset.id);
            deleteMovie(movieId);
        });
    });
}

// Hàm cập nhật số lượng phim trên tab
function updateTabCounts() {
    if (!tabButtons || tabButtons.length < 4) return;

    const allCount = movies.length;
    const showingCount = movies.filter(m => m.status === 1).length;
    const comingCount = movies.filter(m => m.status === 2).length;
    const endedCount = movies.filter(m => m.status === 0).length;

    tabButtons[0].textContent = `Tất cả (${allCount})`;
    tabButtons[1].textContent = `Đang chiếu (${showingCount})`;
    tabButtons[2].textContent = `Sắp chiếu (${comingCount})`;
    tabButtons[3].textContent = `Đã chiếu (${endedCount})`;
}

// Khởi tạo khi DOM loaded
document.addEventListener('DOMContentLoaded', initializeDOM);
