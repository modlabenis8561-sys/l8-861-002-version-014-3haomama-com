import { H as Hls } from './hls-engine.js';

export function initMoviePlayer(videoId, buttonId, source) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var attached = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (attached) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      attached = true;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      attached = true;
      return;
    }

    video.src = source;
    attached = true;
  }

  function hideButton() {
    if (button) {
      button.classList.add('is-hidden');
    }
  }

  function showButton() {
    if (button) {
      button.classList.remove('is-hidden');
    }
  }

  function startPlayback() {
    attachSource();
    hideButton();
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        showButton();
      });
    }
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', hideButton);
  video.addEventListener('pause', function () {
    if (!video.ended) {
      showButton();
    }
  });
  video.addEventListener('ended', showButton);

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
