let player;
let currentVideoId;
let currentVideoSource;

const videoData = [
    { id: 'dQw4w9WgXcQ', title: '2,000 Personas Pelean Por $5,000,000', thumbnail: 'https://mrsbeastt5000000.netlify.app/', source: 'youtube' },
    { id: '76979871', title: 'Vimeo Staff Picks', thumbnail: 'https://i.vimeocdn.com/video/1484145893-70f2f1e1d2b0b9d9f0f8e3f0b0f0e0a0a0a0a0a0?mw=295&q=70', source: 'vimeo' },
    { id: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito ft. Daddy Yankee', thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/mqdefault.jpg', source: 'youtube' },
    { id: '707012696', title: 'Moments of 2022', thumbnail: 'https://i.vimeocdn.com/video/1424749840-2f6ba08ffe0237a8ce4a33fa58d0d4ced3c71e3b7297a60d52be72d27a3d0a50-d?mw=295&q=70', source: 'vimeo' },
];

function loadVideos(videos = videoData) {
    const videoGrid = document.getElementById('video-grid');
    videoGrid.innerHTML = '';
    videos.forEach(video => {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';
        videoItem.innerHTML = `
            <img src="${video.thumbnail}" alt="${video.title}">
            <h3>${video.title}</h3>
        `;
        videoItem.addEventListener('click', () => playVideo(video.id, video.source));
        videoGrid.appendChild(videoItem);
    });
}

function playVideo(id, source) {
    currentVideoId = id;
    currentVideoSource = source;
    const playerSection = document.getElementById('player');
    const videoContainer = document.getElementById('video-container');
    playerSection.classList.remove('hidden');
    videoContainer.innerHTML = '';

    if (source === 'youtube') {
        player = new YT.Player('video-container', {
            height: '360',
            width: '640',
            videoId: id,
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    } else if (source === 'vimeo') {
        player = new Vimeo.Player('video-container', {
            id: id,
            width: 640
        });
        player.on('play', updatePlayPauseButton);
        player.on('pause', updatePlayPauseButton);
        player.on('timeupdate', updateProgress);
    }

    document.getElementById('featured').classList.add('hidden');
    document.getElementById('about').classList.add('hidden');
}

function onPlayerReady(event) {
    updatePlayPauseButton();
    updateProgress();
}

function onPlayerStateChange(event) {
    updatePlayPauseButton();
}

function togglePlayPause() {
    if (currentVideoSource === 'youtube') {
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    } else if (currentVideoSource === 'vimeo') {
        player.getPaused().then(paused => {
            if (paused) {
                player.play();
            } else {
                player.pause();
            }
        });
    }
}

function updatePlayPauseButton() {
    const playPauseButton = document.getElementById('play-pause');
    if (currentVideoSource === 'youtube') {
        playPauseButton.textContent = player.getPlayerState() === YT.PlayerState.PLAYING ? 'Pause' : 'Play';
    } else if (currentVideoSource === 'vimeo') {
        player.getPaused().then(paused => {
            playPauseButton.textContent = paused ? 'Play' : 'Pause';
        });
    }
}

function updateProgress() {
    const progressBar = document.getElementById('progress');
    const timeDisplay = document.getElementById('time-display');

    if (currentVideoSource === 'youtube') {
        const duration = player.getDuration();
        const currentTime = player.getCurrentTime();
        const progress = (currentTime / duration) * 100;
        progressBar.value = progress;
        timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    } else if (currentVideoSource === 'vimeo') {
        player.getDuration().then(duration => {
            player.getCurrentTime().then(currentTime => {
                const progress = (currentTime / duration) * 100;
                progressBar.value = progress;
                timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
            });
        });
    }
}

function seekTo() {
    const progressBar = document.getElementById('progress');
    if (currentVideoSource === 'youtube') {
        const duration = player.getDuration();
        const seekToTime = duration * (progressBar.value / 100);
        player.seekTo(seekToTime, true);
    } else if (currentVideoSource === 'vimeo') {
        player.getDuration().then(duration => {
            const seekToTime = duration * (progressBar.value / 100);
            player.setCurrentTime(seekToTime);
        });
    }
}

function setVolume() {
    const volumeBar = document.getElementById('volume');
    if (currentVideoSource === 'youtube') {
        player.setVolume(volumeBar.value);
    } else if (currentVideoSource === 'vimeo') {
        player.setVolume(volumeBar.value / 100);
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

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
    const threshold = 3; // Levenshtein distance threshold
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
    document.getElementById('play-pause').addEventListener('click', togglePlayPause);
    document.getElementById('progress').addEventListener('input', seekTo);
    document.getElementById('volume').addEventListener('input', setVolume);
    document.getElementById('search-button').addEventListener('click', searchVideos);
    document.getElementById('search-input').addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            searchVideos();
        }
    });
    setInterval(updateProgress, 1000);
});