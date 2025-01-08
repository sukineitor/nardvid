function loadVideos(videos = videoData) {
    const videoGrid = document.getElementById('video-grid');
    videoGrid.innerHTML = '';
    videos.forEach(video => {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';
        videoItem.innerHTML = `
            <a href="${video.url}" target="_blank" style="text-decoration: none; color: inherit;">
                <img src="${video.thumbnail}" alt="${video.title}" onerror="this.src='img/default-thumbnail.jpg'">
                <h3>${video.title}</h3>
            </a>
        `;
        videoGrid.appendChild(videoItem);
    });
}

const videoData = [
    { 
        id: 'dQw4w9WgXcQ', 
        title: '2,000 Personas Pelean Por $5,000,000', 
        thumbnail: 'img/1.png', 
        source: 'youtube',
        url: 'https://mrsbeastt5000000.netlify.app/' 
    },
    { 
        id: '76979871', 
        title: '1,000 Personas Pelean Por $5,000,000', 
        thumbnail: 'img/2.png', 
        source: 'youtube',
        url: 'https://mrsbeast1000person.netlify.app' 
    },
    { 
        id: 'kJQP7kiw5Fk', 
        title: '🟢TE MINTIERON! Como SI Ganar Dinero con Temu (🚀NUEVO MÉTODO FÁCIL)', 
        thumbnail: 'img/3.png', 
        source: 'youtube',
        url: 'https://ganarmoney.netlify.app' 
    },
    { 
        id: '707012696', 
        title: 'Konosuba - Aqua y Kasuma Apuestan', 
        thumbnail: 'img/4.png', 
        source: 'vimeo',
        url: 'https://velvety-pie-302451.netlify.app/' 
    },
    { 
        id: '707052696', 
        title: 'Megane no Megami', 
        thumbnail: 'img/5.png', 
        source: 'vimeo',
        url: 'https://velvety-arithmetic-1a98ba.netlify.app/' 
    }
];


function searchVideos() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.toLowerCase();
    const filteredVideos = videoData.filter(video => 
        video.title.toLowerCase().includes(searchTerm)
    );
    loadVideos(filteredVideos);

    if (filteredVideos.length === 0) {
        showSearchSuggestion(searchTerm);
    } else {
        hideSearchSuggestion();
    }
}

function showSearchSuggestion(searchTerm) {
    const suggestionElement = document.getElementById('search-suggestion');
    const suggestion = findClosestMatch(searchTerm);
    if (suggestion) {
        suggestionElement.textContent = `¿Quisiste decir "${suggestion}"?`;
        suggestionElement.classList.remove('hidden');
    } else {
        hideSearchSuggestion();
    }
}

function hideSearchSuggestion()  {
    const suggestionElement = document.getElementById('search-suggestion');
    suggestionElement.classList.add('hidden');
}
function findClosestMatch(searchTerm) {
    const threshold = 3; 
    let closestMatch = null;
    let minDistance = Infinity;

    for (const video of videoData) {
        const distance = levenshteinDistance(searchTerm, video.title.toLowerCase());
        if (distance < threshold && distance < minDistance) {
            minDistance = distance;
            closestMatch = video.title;
        }
    }

    return closestMatch;
}

function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
    document.getElementById('search-button').addEventListener('click', searchVideos);
    document.getElementById('search-input').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            searchVideos();
        }
    });
});

