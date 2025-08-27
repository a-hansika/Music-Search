// Shazam API configuration
const API_KEY = 'ef83381a7bmsh7f41adab4af6783p154056jsn50843621efb4'; // RapidAPI key
const BASE_URL = 'https://shazam.p.rapidapi.com';

// DOM elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultsList = document.getElementById('results-list');

// Audio player
let currentAudio = null;
let currentlyPlayingBtn = null;

// Event listeners
searchBtn.addEventListener('click', searchMusic);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMusic();
    }
});

// Search for music using Shazam API
async function searchMusic() {
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('Please enter a search term');
        return;
    }

    try {
        const response = await fetch(
            `${BASE_URL}/search?term=${encodeURIComponent(query)}&locale=en-US&offset=0&limit=10`,
            {
                headers: {
                    'X-RapidAPI-Key': API_KEY,
                    'X-RapidAPI-Host': 'shazam.p.rapidapi.com'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch results');
        }

        const data = await response.json();
        displayResults(data.tracks.hits);
    } catch (error) {
        alert('Error fetching music data: ' + error.message);
        clearResults();
    }
}

// Display search results in the UI
function displayResults(tracks) {
    clearResults();
    
    tracks.forEach(track => {
        const trackElement = createTrackElement(track);
        resultsList.appendChild(trackElement);
    });
}

// Create HTML element for a track
function createTrackElement(track) {
    const div = document.createElement('div');
    div.className = 'track-item';
    
    const trackData = track.track;
    const imageUrl = trackData.images ? trackData.images.coverart : 'https://via.placeholder.com/200';
    const previewUrl = trackData.hub?.actions?.[1]?.uri || null;
    
    div.innerHTML = `
        <img class="track-image" src="${imageUrl}" alt="${trackData.title}">
        <div class="track-info">
            <div class="track-name">${trackData.title}</div>
            <div class="track-artist">${trackData.subtitle}</div>
        </div>
        ${previewUrl ? 
            `<button class="preview-btn" data-preview="${previewUrl}" onclick="previewTrack(this, '${previewUrl}')">
                Preview
            </button>` :
            '<button class="preview-btn" disabled>No Preview</button>'
        }
    `;

    return div;
}

// Theme toggle functionality
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = themeToggle.querySelector('i');

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Handle track preview
function previewTrack(button, previewUrl) {
    if (currentAudio && currentAudio.src === previewUrl) {
        if (currentAudio.paused) {
            currentAudio.play();
            updatePlayButton(button, true);
        } else {
            currentAudio.pause();
            updatePlayButton(button, false);
        }
        return;
    }

    if (currentAudio) {
        currentAudio.pause();
        if (currentlyPlayingBtn) {
            updatePlayButton(currentlyPlayingBtn, false);
        }
    }

    currentAudio = new Audio(previewUrl);
    currentlyPlayingBtn = button;
    
    currentAudio.play();
    updatePlayButton(button, true);

    currentAudio.onended = () => {
        updatePlayButton(button, false);
        currentAudio = null;
        currentlyPlayingBtn = null;
    };
}

function updatePlayButton(button, isPlaying) {
    button.innerHTML = isPlaying ? 
        '<i class="fas fa-pause"></i> Pause' : 
        '<i class="fas fa-play"></i> Play';
    button.classList.toggle('playing', isPlaying);
}

// Create HTML element for a track
function createTrackElement(track) {
    const div = document.createElement('div');
    div.className = 'track-card';
    
    const trackData = track.track;
    const imageUrl = trackData.images ? trackData.images.coverart : 'https://via.placeholder.com/200';
    const previewUrl = trackData.hub?.actions?.[1]?.uri || null;
    
    div.innerHTML = `
        <div class="track-image-container">
            <img class="track-image" src="${imageUrl}" alt="${trackData.title}">
            ${previewUrl ? `
                <button class="play-overlay" onclick="previewTrack(this, '${previewUrl}')">
                    <i class="fas fa-play"></i>
                </button>
            ` : ''}
        </div>
        <div class="track-info">
            <h3 class="track-title">${trackData.title}</h3>
            <p class="track-artist">${trackData.subtitle}</p>
            <div class="track-actions">
                ${previewUrl ? `
                    <button class="action-btn" onclick="previewTrack(this, '${previewUrl}')">
                        <i class="fas fa-play"></i> Play
                    </button>
                ` : `
                    <button class="action-btn" disabled>
                        <i class="fas fa-times"></i> No Preview
                    </button>
                `}
            </div>
        </div>
    `;

    return div;
}

// Clear search results
function clearResults() {
    resultsList.innerHTML = '';
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    if (currentlyPlayingBtn) {
        currentlyPlayingBtn.classList.remove('playing');
        currentlyPlayingBtn.textContent = 'Preview';
        currentlyPlayingBtn = null;
    }
}
