(function () {
  var video = document.querySelector('[data-player]');
  var panel = document.querySelector('[data-play-panel]');
  var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-play-trigger]'));
  var hls = null;

  if (!video) {
    return;
  }

  function attach() {
    if (video.getAttribute('data-ready') === '1') {
      return;
    }

    var stream = video.getAttribute('data-stream');

    if (!stream) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }

    video.setAttribute('data-ready', '1');
  }

  function play(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    attach();
    video.controls = true;

    if (panel) {
      panel.classList.add('is-hidden');
    }

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (panel) {
          panel.classList.remove('is-hidden');
        }
      });
    }
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', play);
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    if (panel) {
      panel.classList.add('is-hidden');
    }
  });

  video.addEventListener('ended', function () {
    if (panel) {
      panel.classList.remove('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
})();
