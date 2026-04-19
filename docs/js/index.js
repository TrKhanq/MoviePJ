import { movies as moviesData } from "./models/movies.js";
import { getTickets } from "./models/tickets.js";

let movies = JSON.parse(localStorage.getItem('movies')) || moviesData;
if (!localStorage.getItem('movies')) {
    localStorage.setItem('movies', JSON.stringify(moviesData));
}

document.addEventListener('DOMContentLoaded', function() {
    const currentUserData = localStorage.getItem('currentUser');
    let user = null;
    try {
        user = currentUserData ? JSON.parse(currentUserData) : null; // Nếu không có currentUser hoặc JSON không hợp lệ, user sẽ là null
    } catch (e) {
        alert('Error parsing currentUser from localStorage:', e);
    }
    const authSection = document.getElementById('auth-section');
    const bookBtn = document.getElementById('book-ticket-btn');
    const movieList = document.getElementById('movie-list');
    const paginationContainer = document.getElementById('movie-pagination');
    const subscribeForm = document.querySelector('.subscribe_form');
    const subscribeEmailInput = subscribeForm?.querySelector('input[type="email"]');
    const isLoggedIn = user && user.isActive;
    const loginRedirect = () => { window.location.href = './login.html'; };
    const heroSection = document.querySelector('.hero-section');
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');
    const trendingBadge = document.querySelector('.badge-trending');
        
    let currentPage = 1;
    const moviesPerPage = 4;

    // Mobile menu functionality
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const choiceIndex = document.querySelector('.choice_index');
    
    if (mobileMenuToggle && choiceIndex) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            choiceIndex.classList.toggle('mobile-open');
            
            // Change icon to X when menu is open
            if (choiceIndex.classList.contains('mobile-open')) {
                this.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
                    </svg>
                `;
            } else {
                this.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                `;
            }
        });

        // Close mobile menu when clicking on links
        const navLinks = choiceIndex.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                choiceIndex.classList.remove('mobile-open');
                mobileMenuToggle.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                `;
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!choiceIndex.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                mobileMenuToggle.classList.remove('active');
                choiceIndex.classList.remove('mobile-open');
                mobileMenuToggle.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                    </svg>
                `;
            }
        });
    }

    // Đếm số ghế đã đặt của một vé.
    function countBookedSeats(ticket) {
        if (typeof ticket?.seatCount === 'number' && ticket.seatCount > 0) { // ưu tiên dùng seatCount nếu có và hợp lệ
            return ticket.seatCount;
        }

        if (Array.isArray(ticket?.seats)) {
            return ticket.seats.filter(Boolean).length || 1;// nếu có mảng seats nhưng rỗng hoặc chỉ chứa giá trị falsy, vẫn tính là 1 ghế đã đặt
        }

        return 1;
    }

    // Tìm phim có tổng lượng ghế đặt cao nhất.
    function getTrendingMovie() {
        const tickets = getTickets();
        if (!Array.isArray(tickets) || tickets.length === 0) return null; // nếu không có vé nào, không thể xác định phim thịnh hành

        const bookedSeatsByMovieId = tickets.reduce((acc, ticket) => {
            if (ticket?.statusDisplay === 'Đã hủy') return acc;
            if (typeof ticket?.movieId !== 'number') return acc;

            const bookedSeats = countBookedSeats(ticket);
            acc[ticket.movieId] = (acc[ticket.movieId] || 0) + bookedSeats; 
            return acc;
        }, {});

        const trendingMovieId = Object.entries(bookedSeatsByMovieId).sort((a, b) => b[1] - a[1])[0]?.[0]; 
        if (!trendingMovieId) return null;

        const foundMovie = movies.find(movie => movie.id === Number(trendingMovieId));
        return foundMovie ? { ...foundMovie, tag: 'Thịnh hành' } : null;
    }

    // Render phim thịnh hành lên hero (title/desc/background).
    function renderTrendingMovie() {
        const trendingMovie = getTrendingMovie();
        if (!trendingMovie) return;

        if (heroTitle) {
            heroTitle.textContent = trendingMovie.titleVi || trendingMovie.title;
        }

        if (heroDescription) {
            heroDescription.textContent = trendingMovie.description;
        }

        if (trendingBadge && trendingMovie.tag) {
            trendingBadge.innerHTML = `<span class="dot"></span> ${trendingMovie.tag}`;
        }

        if (heroSection && trendingMovie.posterUrl) {
            heroSection.style.backgroundImage = `url("${trendingMovie.posterUrl}")`;
            heroSection.style.backgroundSize = 'cover';
            heroSection.style.backgroundPosition = 'center';
            heroSection.style.backgroundRepeat = 'no-repeat';
        }
    }

    // Render danh sách phim đang chiếu ở section chính.
    function renderMoviesSection() {
        if (!movieList) return;
        const showingMovies = movies.filter(movie => movie.status === 1);
        const totalPages = Math.max(1, Math.ceil(showingMovies.length / moviesPerPage)); 

        if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        if (showingMovies.length === 0) {
            movieList.innerHTML = '<p class="no-movies">Hiện chưa có phim đang chiếu.</p>';
            paginationContainer.innerHTML = '';
            return;
        }

        const startIndex = (currentPage - 1) * moviesPerPage;
        const currentMovies = showingMovies.slice(startIndex, startIndex + moviesPerPage);

        movieList.innerHTML = currentMovies.map(movie => `
            <div class="movie_item">
                <img src="${movie.posterUrl}" alt="${movie.titleVi || movie.title}" onerror="this.src='https://via.placeholder.com/260x390?text=No+Image'">
                <p>${movie.titleVi || movie.title}</p>
                <div class="infor_mv">
                    <p>🔴${movie.duration} phút</p>
                    <p>🔴${movie.genres}</p>
                </div>
                <button class="booking">Mua vé</button>
            </div>
        `).join('');

        if (!isLoggedIn) {
            movieList.querySelectorAll('.booking').forEach(btn => {
                btn.addEventListener('click', loginRedirect);
            });
        }

        renderPagination(totalPages);
    }

    // Render phân trang cho danh sách phim đang chiếu.
    function renderPagination(totalPages) {
        if (!paginationContainer) return;
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        const buttons = [];
        buttons.push(`<button class="pagination-button" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`);

        for (let i = 1; i <= totalPages; i++) {
            buttons.push(`<button class="pagination-button ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`);
        }

        buttons.push(`<button class="pagination-button" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`);

        paginationContainer.innerHTML = buttons.join('');
        paginationContainer.querySelectorAll('.pagination-button').forEach(btn => {
            btn.addEventListener('click', function () {
                const page = parseInt(this.dataset.page, 10);
                if (page >= 1 && page <= totalPages) {
                    currentPage = page;
                    renderMoviesSection();
                    window.scrollTo({ top: document.querySelector('.showing_movie').offsetTop - 80, behavior: 'smooth' });
                }
            });
        });
    }

    // Hiển thị lỗi cho form đăng ký nhận tin.
    function showSubscribeError(message) {
        if (!subscribeForm || !subscribeEmailInput) return;
        let errorElement = subscribeForm.querySelector('.field-error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'field-error-message';
            errorElement.style.display = 'block';
            errorElement.style.marginTop = '6px';
            errorElement.style.fontSize = '13px';
            errorElement.style.color = '#dc2626';
            subscribeForm.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    // Xóa lỗi form đăng ký nhận tin.
    function clearSubscribeError() {
        const errorElement = subscribeForm?.querySelector('.field-error-message');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    renderTrendingMovie();
    renderMoviesSection();

    subscribeForm?.addEventListener('submit', function (event) {
        event.preventDefault();
        clearSubscribeError();
        // Chỉ check ô email không được để trống.
        if ((subscribeEmailInput?.value || '').trim() === '') {
            showSubscribeError('Email không được để trống.');
            return;
        }
    });

    subscribeEmailInput?.addEventListener('input', clearSubscribeError);

    if (user && user.isActive) {
        // Render user info with logout button
        authSection.innerHTML = `
            <div class="user-info">
                <img src="${user.avatar}" alt="Avatar" class="user-avatar">
                <span>Xin chào ${user.fullName}!</span>
                <button class="btn-logout" id="logout-btn">Đăng xuất</button>
            </div>
        `;
        
        const logoutModalOverlay = document.getElementById('logout-modal-overlay');
        const confirmLogoutBtn = document.getElementById('confirm-logout-btn');
        const cancelLogoutBtn = document.getElementById('cancel-logout-btn');
        const logoutModalClose = document.getElementById('logout-modal-close');

        document.getElementById('logout-btn').addEventListener('click', function() {
            logoutModalOverlay.classList.remove('hidden');
        });

        const closeLogoutModal = () => logoutModalOverlay.classList.add('hidden');
        cancelLogoutBtn.addEventListener('click', closeLogoutModal);
        logoutModalClose.addEventListener('click', closeLogoutModal);

        confirmLogoutBtn.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = './index.html';
        });
    } else {
        // Add event listener to book ticket button to redirect to login
        bookBtn.addEventListener('click', function() {
            window.location.href = './login.html';
        });
    }
});