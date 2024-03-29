module.exports = function initAudioContext() {
  if (typeof AudioContext !== "undefined") {
      return new AudioContext();
  } else if (typeof webkitAudioContext !== "undefined") {
      return new webkitAudioContext();
  } else {
      throw new Error('AudioContext not supported. :(');
  }
};

