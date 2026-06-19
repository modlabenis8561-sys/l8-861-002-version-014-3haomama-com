(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mainNav = document.querySelector('[data-main-nav]');
  var navSearch = document.querySelector('.nav-search');

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
      if (navSearch) {
        navSearch.classList.toggle('is-open');
      }
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function restartHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    startHero();
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')));
        restartHero();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restartHero();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restartHero();
      });
    }
    startHero();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function applyLocalFilter() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = filterYear ? filterYear.value : '';
    filterCards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchYear = !year || cardYear === year;
      card.style.display = matchKeyword && matchYear ? '' : 'none';
    });
  }

  if (filterInput || filterYear) {
    if (filterInput) {
      filterInput.addEventListener('input', applyLocalFilter);
    }
    if (filterYear) {
      filterYear.addEventListener('change', applyLocalFilter);
    }
  }

  var player = document.querySelector('[data-player]');
  var playButton = document.querySelector('[data-play-button]');
  var hlsInstance = null;

  function attachSource() {
    if (!player || player.getAttribute('data-attached') === 'true') {
      return;
    }
    var source = player.getAttribute('data-src');
    if (!source) {
      return;
    }
    if (player.canPlayType('application/vnd.apple.mpegurl')) {
      player.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(player);
    } else {
      player.src = source;
    }
    player.setAttribute('data-attached', 'true');
  }

  if (player) {
    player.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    });
    player.addEventListener('click', function () {
      attachSource();
    });
  }

  if (playButton && player) {
    playButton.addEventListener('click', function () {
      attachSource();
      playButton.classList.add('is-hidden');
      var promise = player.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          playButton.classList.remove('is-hidden');
        });
      }
    });
  }

  var results = document.querySelector('[data-search-results]');
  var summary = document.querySelector('[data-search-summary]');
  var searchInput = document.querySelector('[data-search-page-input]');

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    var meta = [movie.year, movie.region, movie.type].filter(Boolean).join(' · ');
    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + movie.link + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-play">播放</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="card-tags">' + tags + '</div>',
      '    <h3><a href="' + movie.link + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="card-meta">' + escapeHtml(meta) + '</p>',
      '    <p class="card-desc">' + escapeHtml(movie.oneLine || '') + '</p>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  if (results && window.MOVIE_DATA) {
    var query = getQuery();
    if (searchInput) {
      searchInput.value = query;
    }
    var normalized = query.toLowerCase();
    var matched = window.MOVIE_DATA.filter(function (movie) {
      if (!normalized) {
        return false;
      }
      return movie.search.toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 120);
    if (!query) {
      results.innerHTML = '';
      if (summary) {
        summary.textContent = '输入关键词开始查找。';
      }
    } else if (matched.length) {
      results.innerHTML = matched.map(createSearchCard).join('');
      if (summary) {
        summary.textContent = '已找到相关内容，点击卡片进入播放详情。';
      }
    } else {
      results.innerHTML = '';
      if (summary) {
        summary.textContent = '没有找到匹配内容，请尝试更换关键词。';
      }
    }
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
