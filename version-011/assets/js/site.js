(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var next = hero.querySelector("[data-hero-next]");
        var prev = hero.querySelector("[data-hero-prev]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function getText(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function initFilters() {
        var scopes = document.querySelectorAll("[data-filter-scope]");
        scopes.forEach(function (scope) {
            var textInput = scope.querySelector("[data-filter-text]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector("[data-empty-state]");
            var state = {
                text: "",
                year: "全部年份",
                type: "全部类型"
            };

            function apply() {
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = getText([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var matchText = !state.text || haystack.indexOf(state.text) !== -1;
                    var matchYear = state.year === "全部年份" || card.getAttribute("data-year") === state.year;
                    var typeValue = card.getAttribute("data-type") || "";
                    var matchType = state.type === "全部类型" || typeValue.indexOf(state.type) !== -1;
                    var isVisible = matchText && matchYear && matchType;
                    card.style.display = isVisible ? "" : "none";
                    if (isVisible) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            if (textInput) {
                textInput.addEventListener("input", function () {
                    state.text = getText(textInput.value);
                    apply();
                });
            }

            scope.querySelectorAll("[data-filter-group]").forEach(function (group) {
                var key = group.getAttribute("data-filter-group");
                var buttons = Array.prototype.slice.call(group.querySelectorAll("button"));
                if (buttons[0]) {
                    buttons[0].classList.add("is-active");
                }
                buttons.forEach(function (button) {
                    button.addEventListener("click", function () {
                        buttons.forEach(function (item) {
                            item.classList.remove("is-active");
                        });
                        button.classList.add("is-active");
                        if (key === "year") {
                            state.year = button.getAttribute("data-filter-year") || "全部年份";
                        }
                        if (key === "type") {
                            state.type = button.getAttribute("data-filter-type") || "全部类型";
                        }
                        apply();
                    });
                });
            });
            apply();
        });
    }

    function initPlayers() {
        var videos = Array.prototype.slice.call(document.querySelectorAll("video[data-hls]"));
        videos.forEach(function (video) {
            prepareVideo(video);
            var shell = video.closest(".player-shell");
            var overlay = shell ? shell.querySelector("[data-play-button]") : null;
            if (overlay) {
                overlay.addEventListener("click", function () {
                    prepareVideo(video);
                    overlay.classList.add("is-hidden");
                    var result = video.play();
                    if (result && typeof result.catch === "function") {
                        result.catch(function () {});
                    }
                });
            }
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
        });
    }

    function prepareVideo(video) {
        if (!video || video.getAttribute("data-ready") === "true") {
            return;
        }
        var src = video.getAttribute("data-hls");
        if (!src) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            video.hlsInstance = hls;
        } else {
            video.src = src;
        }
        video.setAttribute("data-ready", "true");
    }

    function escapeHtml(value) {
        return (value || "").toString().replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#039;"
            }[char];
        });
    }

    function createSearchCard(movie) {
        return "" +
            "<a class=\"movie-card\" href=\"" + escapeHtml(movie.url) + "\">" +
                "<span class=\"poster-frame\">" +
                    "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" class=\"poster-image\" loading=\"lazy\" onerror=\"this.classList.add('is-empty')\">" +
                    "<span class=\"poster-badge poster-badge-right\">" + escapeHtml(movie.type) + "</span>" +
                    "<span class=\"poster-badge poster-badge-left\">" + escapeHtml(movie.year) + "</span>" +
                "</span>" +
                "<span class=\"movie-card-body\">" +
                    "<strong class=\"movie-card-title\">" + escapeHtml(movie.title) + "</strong>" +
                    "<span class=\"movie-card-desc\">" + escapeHtml(movie.oneLine) + "</span>" +
                    "<span class=\"movie-card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></span>" +
                "</span>" +
            "</a>";
    }

    function initSearchPage() {
        var page = document.querySelector("[data-search-page]");
        if (!page || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = getText(params.get("q") || "");
        var input = page.querySelector("[data-search-input]");
        var title = page.querySelector("[data-search-title]");
        var results = page.querySelector("[data-search-results]");
        var empty = page.querySelector("[data-search-empty]");
        if (input) {
            input.value = params.get("q") || "";
        }
        var data = window.MOVIE_SEARCH_DATA;
        var list = data.filter(function (movie) {
            if (!query) {
                return true;
            }
            return getText([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.tags,
                movie.oneLine
            ].join(" ")).indexOf(query) !== -1;
        });
        if (title) {
            title.textContent = query ? "搜索结果：" + (params.get("q") || "") : "推荐片库";
        }
        if (results) {
            results.innerHTML = list.slice(0, 240).map(createSearchCard).join("");
        }
        if (empty) {
            empty.classList.toggle("is-visible", list.length === 0);
        }
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFilters();
        initPlayers();
        initSearchPage();
    });
})();
