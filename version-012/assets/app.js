(function () {
  var siteHeader = document.querySelector('.site-header');
  var menuToggle = document.querySelector('.menu-toggle');

  if (siteHeader && menuToggle) {
    menuToggle.addEventListener('click', function () {
      var isOpen = siteHeader.classList.toggle('nav-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var backTop = document.querySelector('.back-top');

  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 320) {
        backTop.classList.add('visible');
      } else {
        backTop.classList.remove('visible');
      }
    });

    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeIndex = 0;
  var heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeIndex);
    });
  }

  function startHero() {
    if (slides.length <= 1) {
      return;
    }

    heroTimer = window.setInterval(function () {
      showHero(activeIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showHero(index);
      if (heroTimer) {
        window.clearInterval(heroTimer);
      }
      startHero();
    });
  });

  showHero(0);
  startHero();

  function loadHlsScript() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }

      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function bindPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-overlay');

    if (!video || !button) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var ready = false;
    var hlsInstance = null;

    function prepareVideo() {
      if (ready || !stream) {
        return Promise.resolve();
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return Promise.resolve();
      }

      return loadHlsScript().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: false });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }).catch(function () {
        video.src = stream;
      });
    }

    function playVideo() {
      prepareVideo().then(function () {
        button.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        var playResult = video.play();

        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {});
        }
      });
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    player.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        playVideo();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.video-player')).forEach(bindPlayer);

  var searchInput = document.getElementById('searchInput');
  var searchResults = document.getElementById('searchResults');
  var filterPanel = document.getElementById('filterPanel');
  var typeFilter = document.getElementById('typeFilter');
  var yearFilter = document.getElementById('yearFilter');
  var categoryFilter = document.getElementById('categoryFilter');

  function cardTemplate(item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a class="poster-link" href="./' + escapeHtml(item.url) + '" aria-label="' + escapeHtml(item.title) + '">' +
      '<img src="./' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
      '<span class="poster-badge">' + escapeHtml(item.year) + '</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<div class="movie-meta-line"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.region) + '</span></div>' +
      '<h3><a href="./' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
      '<p>' + escapeHtml(item.oneLine) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function runSearch() {
    if (!searchResults || !window.siteCatalog) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (searchInput && !searchInput.value && initialQuery) {
      searchInput.value = initialQuery;
    }

    var query = normalize(searchInput ? searchInput.value : initialQuery);
    var typeValue = typeFilter ? typeFilter.value : '';
    var yearValue = yearFilter ? yearFilter.value : '';
    var categoryValue = categoryFilter ? categoryFilter.value : '';

    var result = window.siteCatalog.filter(function (item) {
      var source = normalize([
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.oneLine,
        item.tags.join(' ')
      ].join(' '));

      return (!query || source.indexOf(query) > -1) &&
        (!typeValue || item.type === typeValue) &&
        (!yearValue || item.year === yearValue) &&
        (!categoryValue || item.category === categoryValue);
    }).slice(0, 96);

    searchResults.innerHTML = result.map(cardTemplate).join('');
  }

  if (filterPanel && searchResults) {
    filterPanel.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch();
    });

    [searchInput, typeFilter, yearFilter, categoryFilter].forEach(function (field) {
      if (field) {
        field.addEventListener('input', runSearch);
        field.addEventListener('change', runSearch);
      }
    });

    runSearch();
  }
}());
