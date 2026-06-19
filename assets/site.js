function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
}

ready(function () {
    initializeMenu();
    initializeHero();
    initializeFilters();
    initializeSearchPage();
    initializePlayers();
    initializeScrollTop();
});

function initializeMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
        return;
    }
    button.addEventListener("click", function () {
        nav.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", nav.classList.contains("is-open"));
    });
}

function initializeHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === current);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            show(Number(dot.getAttribute("data-hero-dot")) || 0);
            start();
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            show(current - 1);
            start();
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            show(current + 1);
            start();
        });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
}

function initializeFilters() {
    var scope = document.querySelector("[data-card-filter]");
    var list = document.querySelector("[data-card-list]");
    if (!scope || !list) {
        return;
    }
    var input = scope.querySelector("[data-filter-keyword]");
    var select = scope.querySelector("[data-filter-category]");
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

    function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var category = select ? select.value : "";
        cards.forEach(function (card) {
            var text = [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-genre")
            ].join(" ").toLowerCase();
            var okKeyword = !keyword || text.indexOf(keyword) !== -1;
            var okCategory = !category || card.getAttribute("data-category") === category;
            card.classList.toggle("is-hidden-card", !(okKeyword && okCategory));
        });
    }

    if (input) {
        input.addEventListener("input", apply);
    }
    if (select) {
        select.addEventListener("change", apply);
    }
}

function initializeSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    if (!form || !input || !results || !window.siteMovies) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var firstQuery = params.get("q") || "";
    input.value = firstQuery;

    function card(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<a class="movie-card" href="" + movie.file + "">" +
            "<span class="poster-frame">" +
            "<img src="./" + movie.cover + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">" +
            "<span class="poster-shade"></span>" +
            "<span class="duration-pill">" + escapeHtml(movie.duration) + "</span>" +
            "</span>" +
            "<span class="movie-info">" +
            "<span class="meta-row"><span class="chip primary">" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span></span>" +
            "<strong>" + escapeHtml(movie.title) + "</strong>" +
            "<span class="line-clamp">" + escapeHtml(movie.oneLine) + "</span>" +
            "<span class="tag-row">" + tags + "</span>" +
            "</span>" +
            "</a>";
    }

    function render(query) {
        var keyword = query.trim().toLowerCase();
        var source = keyword ? window.siteMovies.filter(function (movie) {
            return [movie.title, movie.region, movie.type, movie.genre, movie.oneLine, movie.tags.join(" ")].join(" ").toLowerCase().indexOf(keyword) !== -1;
        }) : window.siteMovies.slice(0, 48);
        results.innerHTML = source.slice(0, 160).map(card).join("");
        if (title) {
            title.textContent = keyword ? "搜索结果" : "浏览影视内容";
        }
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input.value.trim();
        var url = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
        history.replaceState(null, "", url);
        render(query);
    });

    render(firstQuery);
}

function initializePlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
        var video = player.querySelector("video");
        var overlay = player.querySelector("[data-player-overlay]");
        var toggles = Array.prototype.slice.call(player.querySelectorAll("[data-player-toggle]"));
        var mute = player.querySelector("[data-player-mute]");
        var fullscreen = player.querySelector("[data-player-fullscreen]");
        var prepared = false;
        var hlsInstance = null;

        function prepare() {
            if (prepared || !video) {
                return;
            }
            var src = video.getAttribute("data-stream");
            if (!src) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = src;
            }
            video.controls = true;
            prepared = true;
        }

        function playVideo() {
            prepare();
            if (!video) {
                return;
            }
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var action = video.paused ? video.play() : video.pause();
            if (action && action.catch) {
                action.catch(function () {});
            }
        }

        toggles.forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                playVideo();
            });
        });

        if (video) {
            video.addEventListener("click", playVideo);
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
            video.addEventListener("pause", function () {
                player.classList.remove("is-playing");
            });
            video.addEventListener("ended", function () {
                player.classList.remove("is-playing");
            });
        }

        if (mute) {
            mute.addEventListener("click", function () {
                if (!video) {
                    return;
                }
                video.muted = !video.muted;
                mute.textContent = video.muted ? "取消静音" : "静音";
            });
        }

        if (fullscreen) {
            fullscreen.addEventListener("click", function () {
                if (!video) {
                    return;
                }
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (video.requestFullscreen) {
                    video.requestFullscreen();
                }
            });
        }

        var detailPlay = document.querySelector("[data-detail-play]");
        if (detailPlay) {
            detailPlay.addEventListener("click", function (event) {
                event.preventDefault();
                player.scrollIntoView({ behavior: "smooth", block: "center" });
                window.setTimeout(playVideo, 360);
            });
        }

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}

function initializeScrollTop() {
    var button = document.querySelector("[data-scroll-top]");
    if (!button) {
        return;
    }
    button.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
