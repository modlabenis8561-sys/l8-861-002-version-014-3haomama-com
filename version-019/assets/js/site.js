(function () {
  var mobileButton = document.querySelector('.mobile-menu-button');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      var expanded = mobileButton.getAttribute('aria-expanded') === 'true';
      mobileButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  var hero = document.querySelector('.hero-carousel');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    startTimer();
  }

  var searchData = Array.isArray(window.SiteSearch) ? window.SiteSearch : [];

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function recordText(record) {
    return normalize([
      record.title,
      record.year,
      record.region,
      record.type,
      record.genre,
      record.category,
      Array.isArray(record.tags) ? record.tags.join('') : ''
    ].join(' '));
  }

  function resultItem(record) {
    return [
      '<a class="search-result-item" href="' + record.url + '">',
      '<img src="' + record.cover + '" alt="' + record.title.replace(/"/g, '&quot;') + '">',
      '<span>',
      '<strong>' + record.title + '</strong>',
      '<span>' + record.year + '年 · ' + record.region + ' · ' + record.type + '</span>',
      '</span>',
      '</a>'
    ].join('');
  }

  document.querySelectorAll('.site-search').forEach(function (form) {
    var input = form.querySelector('.site-search-input');
    var panel = form.querySelector('.search-results');

    if (!input || !panel) {
      return;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
    });

    input.addEventListener('input', function () {
      var query = normalize(input.value);

      if (!query) {
        panel.hidden = true;
        panel.innerHTML = '';
        return;
      }

      var matches = searchData.filter(function (record) {
        return recordText(record).indexOf(query) !== -1;
      }).slice(0, 12);

      if (!matches.length) {
        panel.innerHTML = '<div class="search-empty">没有找到相关影片</div>';
      } else {
        panel.innerHTML = matches.map(resultItem).join('');
      }

      panel.hidden = false;
    });

    document.addEventListener('click', function (event) {
      if (!form.contains(event.target)) {
        panel.hidden = true;
      }
    });
  });

  document.querySelectorAll('[data-card-filter]').forEach(function (filterBar) {
    var section = filterBar.closest('.category-list-section');
    var cards = section ? Array.prototype.slice.call(section.querySelectorAll('.movie-card')) : [];
    var input = filterBar.querySelector('.local-search-input');
    var year = filterBar.querySelector('.local-year-select');
    var type = filterBar.querySelector('.local-type-select');

    function applyFilter() {
      var query = normalize(input ? input.value : '');
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var visible = true;

        if (query && text.indexOf(query) === -1) {
          visible = false;
        }

        if (selectedYear && cardYear !== selectedYear) {
          visible = false;
        }

        if (selectedType && cardType !== selectedType) {
          visible = false;
        }

        card.hidden = !visible;
      });
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
})();
