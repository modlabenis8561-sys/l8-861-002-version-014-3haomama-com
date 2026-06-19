function initMoviePlayer(streamUrl) {
    const video = document.getElementById("moviePlayer");
    const overlay = document.getElementById("playOverlay");

    if (!video || !overlay || !streamUrl) {
        return;
    }

    let hls = null;
    let attached = false;

    function playVideo() {
        const playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function() {});
        }
    }

    function attachStream() {
        if (attached) {
            playVideo();
            return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            playVideo();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                playVideo();
            });
            return;
        }

        video.src = streamUrl;
        playVideo();
    }

    function start() {
        overlay.classList.add("is-hidden");
        attachStream();
    }

    overlay.addEventListener("click", start);

    video.addEventListener("click", function() {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener("play", function() {
        overlay.classList.add("is-hidden");
    });

    window.addEventListener("pagehide", function() {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
