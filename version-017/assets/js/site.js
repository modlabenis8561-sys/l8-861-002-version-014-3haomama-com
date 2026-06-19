document.addEventListener("DOMContentLoaded", function() {
    const toggle = document.querySelector(".mobile-nav-toggle");
    const panel = document.querySelector(".mobile-nav-panel");

    if (toggle && panel) {
        toggle.addEventListener("click", function() {
            const expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            panel.hidden = expanded;
        });
    }

    const carousel = document.querySelector(".hero-carousel");

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
        const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
        const prev = carousel.querySelector(".hero-control-prev");
        const next = carousel.querySelector(".hero-control-next");
        let active = Math.max(0, slides.findIndex(function(slide) {
            return slide.classList.contains("is-active");
        }));
        let timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });

            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }

            timer = setInterval(function() {
                showSlide(active + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function() {
                showSlide(active - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                showSlide(active + 1);
                startTimer();
            });
        }

        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                showSlide(Number(dot.getAttribute("data-slide") || 0));
                startTimer();
            });
        });

        showSlide(active);
        startTimer();
    }

    const searchParams = new URLSearchParams(window.location.search);
    const queryFromUrl = searchParams.get("q") || "";
    const grids = Array.from(document.querySelectorAll(".searchable-grid"));

    grids.forEach(function(grid) {
        const section = grid.closest(".movie-list-section") || document;
        const input = section.querySelector(".movie-search-input");
        const selects = Array.from(section.querySelectorAll(".movie-filter-select"));
        const empty = section.querySelector(".empty-result");
        const cards = Array.from(grid.querySelectorAll(".movie-card"));

        if (input && queryFromUrl) {
            input.value = queryFromUrl;
        }

        function matchesText(card, text) {
            if (!text) {
                return true;
            }

            const fields = [
                card.getAttribute("data-title") || "",
                card.getAttribute("data-region") || "",
                card.getAttribute("data-type") || "",
                card.getAttribute("data-year") || "",
                card.getAttribute("data-genre") || "",
                card.getAttribute("data-tags") || ""
            ].join(" ").toLowerCase();

            return fields.includes(text.toLowerCase());
        }

        function matchesSelects(card) {
            return selects.every(function(select) {
                const value = select.value;
                const key = select.getAttribute("data-filter");

                if (!value || !key) {
                    return true;
                }

                return (card.getAttribute("data-" + key) || "") === value;
            });
        }

        function applyFilters() {
            const text = input ? input.value.trim() : "";
            let visible = 0;

            cards.forEach(function(card) {
                const matched = matchesText(card, text) && matchesSelects(card);
                card.hidden = !matched;

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener("input", applyFilters);
        }

        selects.forEach(function(select) {
            select.addEventListener("change", applyFilters);
        });

        applyFilters();
    });
});
