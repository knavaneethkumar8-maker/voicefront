const audio = document.querySelector('.js-audio-file');


export function playAudioSegment(audioEl, startTime, endTime) {
  if(!audioEl) return;

  if(startTime > endTime) return;

  audioEl.currentTime = startTime;
  audioEl.play();

    let rafId;

  function monitor() {
    if (audioEl.currentTime >= endTime) {
      audioEl.pause();
      cancelAnimationFrame(rafId);
      return;
    }
    rafId = requestAnimationFrame(monitor);
  }

  monitor();

}


//playAudioSegment(audio,4.004, 4.410 );