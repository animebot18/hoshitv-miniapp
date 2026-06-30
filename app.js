// Telegram Web App initialization
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// State management
let allAnimes = [];
let filteredAnimes = [];
let currentAnime = null;
let userProfile = {
    id: tg.initDataUnsafe?.user?.id || 0,
    firstName: tg.initDataUnsafe?.user?.first_name || 'User',
    username: tg.initDataUnsafe?.user?.username || '',
    isPremium: false,
    premiumUntil: null,
    favorites: []
};

// API base URL (will be your bot's web server)
const API_URL = window.location.origin;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadAnimes();
    loadUserProfile();
});

// Initialize app
function initializeApp() {
    // Apply Telegram theme
    document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
    document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
    document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2481cc');
    document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
    document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
    document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f4f4f5');
    
    // Set header color
    tg.setHeaderColor(tg.themeParams.bg_color || '#ffffff');
}

// Setup event listeners
function setupEventListeners() {
    // Search button
    document.getElementById('searchBtn').addEventListener('click', toggleSearch);
    document.getElementById('closeSearch').addEventListener('click', toggleSearch);
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Profile button
    document.getElementById('profileBtn').addEventListener('click', openProfile);
    document.getElementById('closeProfile').addEventListener('click', closeProfile);
    
    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', (e) => handleFilterTab(e.target.dataset.filter));
    });
    
    // Genre and year filters
    document.getElementById('genreSelect').addEventListener('change', applyFilters);
    document.getElementById('yearSelect').addEventListener('change', applyFilters);
    
    // Modal close
    document.getElementById('closeModal').addEventListener('click', closeAnimeModal);
    document.getElementById('animeModal').addEventListener('click', (e) => {
        if (e.target.id === 'animeModal') closeAnimeModal();
    });
    document.getElementById('profileModal').addEventListener('click', (e) => {
        if (e.target.id === 'profileModal') closeProfile();
    });
    
    // Profile actions
    document.getElementById('premiumBtn').addEventListener('click', () => {
        tg.close();
        tg.sendData(JSON.stringify({ action: 'open_premium' }));
    });
    
    document.getElementById('favoritesBtn').addEventListener('click', showFavorites);
}

// Toggle search
function toggleSearch() {
    const searchContainer = document.getElementById('searchContainer');
    const searchInput = document.getElementById('searchInput');
    
    if (searchContainer.style.display === 'none') {
        searchContainer.style.display = 'flex';
        searchInput.focus();
    } else {
        searchContainer.style.display = 'none';
        searchInput.value = '';
        applyFilters();
    }
}

// Handle search
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (query === '') {
        applyFilters();
        return;
    }
    
    filteredAnimes = allAnimes.filter(anime => 
        anime.title.toLowerCase().includes(query) ||
        anime.genres.toLowerCase().includes(query)
    );
    
    renderAnimes(filteredAnimes);
}

// Handle filter tabs
function handleFilterTab(filter) {
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.filter === filter);
    });
    
    // Apply filter
    switch(filter) {
        case 'all':
            filteredAnimes = [...allAnimes];
            break;
        case 'new':
            filteredAnimes = [...allAnimes].sort((a, b) => b.created_at - a.created_at);
            break;
        case 'popular':
            filteredAnimes = [...allAnimes].sort((a, b) => b.view_count - a.view_count);
            break;
        case 'premium':
            filteredAnimes = allAnimes.filter(anime => anime.is_premium === 1);
            break;
    }
    
    applyFilters();
}

// Apply filters
function applyFilters() {
    const genre = document.getElementById('genreSelect').value.toLowerCase();
    const year = document.getElementById('yearSelect').value;
    
    let filtered = [...filteredAnimes];
    
    // Genre filter
    if (genre) {
        filtered = filtered.filter(anime => 
            anime.genres.toLowerCase().includes(genre)
        );
    }
    
    // Year filter
    if (year) {
        if (year === 'older') {
            filtered = filtered.filter(anime => anime.year < 2020);
        } else {
            filtered = filtered.filter(anime => anime.year === parseInt(year));
        }
    }
    
    renderAnimes(filtered);
}

// Load animes from API
async function loadAnimes() {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_URL}/api/animes?user_id=${userProfile.id}`);
        
        if (!response.ok) {
            throw new Error('Failed to load animes');
        }
        
        const data = await response.json();
        allAnimes = data.animes || [];
        filteredAnimes = [...allAnimes];
        
        renderAnimes(filteredAnimes);
        showLoading(false);
    } catch (error) {
        console.error('Error loading animes:', error);
        showLoading(false);
        showEmpty();
        tg.showAlert('Animelarni yuklashda xatolik yuz berdi');
    }
}

// Load user profile
async function loadUserProfile() {
    try {
        const response = await fetch(`${API_URL}/api/profile?user_id=${userProfile.id}`);
        
        if (!response.ok) return;
        
        const data = await response.json();
        userProfile = { ...userProfile, ...data };
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Render animes
function renderAnimes(animes) {
    const grid = document.getElementById('animeGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (animes.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    grid.innerHTML = animes.map(anime => `
        <div class="anime-card" onclick="openAnimeModal(${anime.id})">
            <div class="anime-card-image">
                ${anime.poster_file_id 
                    ? `<img src="${API_URL}/api/poster/${anime.poster_file_id}" alt="${anime.title}" onerror="this.parentElement.innerHTML='🎬'">`
                    : '🎬'
                }
            </div>
            <div class="anime-card-content">
                <div class="anime-card-title">${anime.title}</div>
                <div class="anime-card-meta">
                    <span class="anime-card-tag">${anime.genres.split(',')[0]}</span>
                    <span class="anime-card-tag">${anime.year}</span>
                </div>
                <div class="anime-card-stats">
                    <span>👁 ${anime.view_count || 0}</span>
                    ${anime.is_premium ? '<span class="premium-badge">💎 Premium</span>' : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Open anime modal
async function openAnimeModal(animeId) {
    try {
        // Haptic feedback
        tg.HapticFeedback.impactOccurred('light');
        
        // Find anime
        const anime = allAnimes.find(a => a.id === animeId);
        if (!anime) return;
        
        currentAnime = anime;
        
        // Load episodes
        const response = await fetch(`${API_URL}/api/episodes/${animeId}`);
        const data = await response.json();
        const episodes = data.episodes || [];
        
        // Update modal content
        document.getElementById('modalTitle').textContent = anime.title;
        document.getElementById('modalGenre').textContent = anime.genres;
        document.getElementById('modalYear').textContent = anime.year;
        document.getElementById('modalViews').textContent = anime.view_count || 0;
        document.getElementById('modalVoice').textContent = `🎙 ${anime.voice_actor}`;
        
        // Show/hide premium badge
        const premiumBadge = document.getElementById('modalPremium');
        if (anime.is_premium) {
            premiumBadge.style.display = 'inline';
        } else {
            premiumBadge.style.display = 'none';
        }
        
        // Set poster
        const posterImg = document.getElementById('modalPoster');
        if (anime.poster_file_id) {
            posterImg.src = `${API_URL}/api/poster/${anime.poster_file_id}`;
            posterImg.style.display = 'block';
        } else {
            posterImg.style.display = 'none';
        }
        
        // Render episodes
        renderEpisodes(episodes, anime.is_premium);
        
        // Show modal
        const modal = document.getElementById('animeModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        console.error('Error opening anime modal:', error);
        tg.showAlert('Xatolik yuz berdi');
    }
}

// Close anime modal
function closeAnimeModal() {
    const modal = document.getElementById('animeModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
    currentAnime = null;
}

// Render episodes
function renderEpisodes(episodes, isPremium) {
    const grid = document.getElementById('episodesGrid');
    
    if (episodes.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--tg-theme-hint-color);">Qismlar mavjud emas</p>';
        return;
    }
    
    const canWatch = !isPremium || userProfile.isPremium;
    
    grid.innerHTML = episodes.map(episode => {
        const isLocked = !canWatch;
        return `
            <button 
                class="episode-btn ${isLocked ? 'locked' : ''}" 
                onclick="selectEpisode(${episode.id}, ${isLocked})"
            >
                ${episode.episode_number}${isLocked ? ' 🔒' : ''}
            </button>
        `;
    }).join('');
}

// Select episode
window.selectEpisode = function(episodeId, isLocked) {
    if (isLocked) {
        tg.HapticFeedback.notificationOccurred('error');
        tg.showAlert('Bu premium anime! Premium obuna sotib oling.');
        return;
    }
    
    tg.HapticFeedback.impactOccurred('medium');
    
    // Send data to bot
    const data = {
        action: 'watch_episode',
        anime_id: currentAnime.id,
        episode_id: episodeId,
        user_id: userProfile.id
    };
    
    tg.sendData(JSON.stringify(data));
    
    // Show confirmation
    tg.showPopup({
        title: '📹 Video yuborilmoqda',
        message: 'Botda videoni kutib turing...',
        buttons: [{type: 'ok'}]
    });
};

// Open profile
function openProfile() {
    tg.HapticFeedback.impactOccurred('light');
    
    // Update profile info
    document.getElementById('profileName').textContent = userProfile.firstName;
    document.getElementById('profileUsername').textContent = userProfile.username ? `@${userProfile.username}` : '';
    document.getElementById('favoriteCount').textContent = userProfile.favorites?.length || 0;
    document.getElementById('watchedCount').textContent = userProfile.watched || 0;
    
    // Update premium status
    const premiumSection = document.getElementById('premiumStatus');
    const premiumTitle = document.getElementById('premiumTitle');
    const premiumText = document.getElementById('premiumText');
    const premiumBtn = document.getElementById('premiumBtn');
    
    if (userProfile.isPremium && userProfile.premiumUntil) {
        premiumSection.classList.add('active');
        premiumTitle.textContent = 'Premium obuna faol';
        
        const until = new Date(userProfile.premiumUntil * 1000);
        const days = Math.ceil((until - new Date()) / (1000 * 60 * 60 * 24));
        premiumText.textContent = `${days} kun qoldi • ${until.toLocaleDateString('uz-UZ')} gacha`;
        premiumBtn.textContent = 'Premium uzaytirish';
    } else {
        premiumSection.classList.remove('active');
        premiumTitle.textContent = 'Premium obuna';
        premiumText.textContent = 'Premium obunangiz yo\'q';
        premiumBtn.textContent = 'Premium sotib olish';
    }
    
    // Show modal
    const modal = document.getElementById('profileModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Close profile
function closeProfile() {
    const modal = document.getElementById('profileModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// Show favorites
function showFavorites() {
    closeProfile();
    
    if (!userProfile.favorites || userProfile.favorites.length === 0) {
        tg.showAlert('Sizning sevimli animelaringiz yo\'q');
        return;
    }
    
    // Filter favorites
    filteredAnimes = allAnimes.filter(anime => 
        userProfile.favorites.includes(anime.id)
    );
    
    renderAnimes(filteredAnimes);
    
    // Update filter tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
}

// Show/hide loading
function showLoading(show) {
    const loading = document.getElementById('loading');
    const grid = document.getElementById('animeGrid');
    
    if (show) {
        loading.style.display = 'flex';
        grid.style.display = 'none';
    } else {
        loading.style.display = 'none';
        grid.style.display = 'grid';
    }
}

// Show empty state
function showEmpty() {
    const emptyState = document.getElementById('emptyState');
    const grid = document.getElementById('animeGrid');
    
    grid.innerHTML = '';
    emptyState.style.display = 'block';
}

// Back button handler
tg.BackButton.onClick(() => {
    if (document.getElementById('animeModal').classList.contains('show')) {
        closeAnimeModal();
    } else if (document.getElementById('profileModal').classList.contains('show')) {
        closeProfile();
    } else {
        tg.close();
    }
});

// Show back button when modal is open
const modalObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.target.classList.contains('show')) {
            tg.BackButton.show();
        } else {
            const anyModalOpen = document.querySelector('.modal.show');
            if (!anyModalOpen) {
                tg.BackButton.hide();
            }
        }
    });
});

modalObserver.observe(document.getElementById('animeModal'), { attributes: true, attributeFilter: ['class'] });
modalObserver.observe(document.getElementById('profileModal'), { attributes: true, attributeFilter: ['class'] });
