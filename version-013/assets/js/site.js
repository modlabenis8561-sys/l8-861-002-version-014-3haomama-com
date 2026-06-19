(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function normalize(text) {
        return String(text || "").toLowerCase().trim();
    }

    document.addEventListener("DOMContentLoaded", function () {
        var toggle = one("[data-menu-toggle]");
        var menu = one("[data-mobile-nav]");

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        var slides = all("[data-hero-slide]");
        var dots = all("[data-hero-dot]");
        var prev = one("[data-hero-prev]");
        var next = one("[data-hero-next]");
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === active);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            if (slides.length > 1) {
                timer = setInterval(function () {
                    showSlide(active + 1);
                }, 5600);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(active + 1);
                restart();
            });
        }

        restart();

        var inputs = all("[data-card-search]");
        var buttons = all("[data-filter-button]");
        var currentFilter = "全部";

        function cardText(card) {
            return normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-tags")
            ].join(" "));
        }

        function applyFilter() {
            var query = normalize(inputs.map(function (input) {
                return input.value;
            }).filter(Boolean).join(" "));
            var shown = 0;
            var cards = all("[data-card]");

            cards.forEach(function (card) {
                var text = cardText(card);
                var matchedText = !query || text.indexOf(query) !== -1;
                var filter = normalize(currentFilter);
                var matchedFilter = currentFilter === "全部" || text.indexOf(filter) !== -1;
                var visible = matchedText && matchedFilter;
                card.style.display = visible ? "" : "none";
                if (visible) {
                    shown += 1;
                }
            });

            all("[data-empty-state]").forEach(function (empty) {
                empty.classList.toggle("is-visible", shown === 0);
            });
        }

        inputs.forEach(function (input) {
            input.addEventListener("input", applyFilter);
        });

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                currentFilter = button.getAttribute("data-filter-button") || "全部";
                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                applyFilter();
            });
        });
    });

    window.setupPlayer = function (videoId, overlayId, u) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var ready = false;
        var player = null;

        if (!video || !overlay || !u) {
            return;
        }

        function attach() {
            if (ready) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = u;
            } else if (window.Hls && window.Hls.isSupported()) {
                player = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                player.loadSource(u);
                player.attachMedia(video);
            } else {
                video.src = u;
            }

            ready = true;
        }

        function play() {
            attach();
            overlay.classList.add("is-hidden");
            video.controls = true;
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        overlay.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!ready) {
                play();
            }
        });
    };
})();
