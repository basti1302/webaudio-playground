'use strict';

var bpm = 120;
var beats = 4;
var initialDelay = .1;
var startTimeOffset;

var twelvthRootOfTwo = 1.059463094;

var minOctave = 0;
var maxOctave = 10;

function calculateTime(bar, beat, eigth, sixteenth, thirtytwoth) {
  if (typeof bar === 'undefined') { bar = 1 };
  if (typeof beat === 'undefined') { beat = 1 };
  if (typeof eigth === 'undefined') { eigth = 1 };
  if (typeof sixteenth === 'undefined') { sixteenth = 1 };
  if (typeof thirtytwoth === 'undefined') { thirtytwoth = 1 };
  return startTimeOffset + ((bar-1) * beats + (beat-1) + ((eigth-1) / 2) + ((sixteenth-1) / 4) + ((thirtytwoth-1) / 8)) * 60 / bpm;
}
var t = calculateTime;

function play(tune) {
  precalculateFrequencies();
  startTimeOffset = audioCtx.currentTime + initialDelay;
  osc.start(t());
  for (var i = 0; i < tune.length; i++) {
    var cmd = tune[i];
    if (cmd[1] === '-') {
      osc.stop(t.apply(null, cmd[2]));
    } else {
      osc.frequency.setValueAtTime(octaves[cmd[0]][cmd[1]], t.apply(null, cmd[2]));
    }
  }
};

function calculateFrequency(n) {
  // using equal temperament
  return 440 * Math.pow(twelvthRootOfTwo, (n - 49));
}

var octaves = [];

// precalculate frequencies
function precalculateFrequencies() {
  var toneNames = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
  for (var o = minOctave; o < maxOctave; o++) {
    var octave = {};
    octaves[o] = octave;
    for (var t = 0; t < 12; t++) {
      var n = o * 12 + t - 8 ;
      octave[toneNames[t]] = calculateFrequency(n);
    }
  }
}

rar audioCtx;
if (typeof AudioContext !== "undefined") {
    audioCtx = new AudioContext();
} else if (typeof webkitAudioContext !== "undefined") {
    audioCtx = new webkitAudioContext();
} else {
    throw new Error('AudioContext not supported. :(');
}

var osc = audioCtx.createOscillator();
osc.type = 'square';

var volumeNode = audioCtx.createGain();
volumeNode.gain.value = 1;

var lowPassFilter = audioCtx.createBiquadFilter();
lowPassFilter.type = 0; // (Low-pass)
lowPassFilter.frequency.value = 2000;
lowPassFilter.frequency.setTargetAtTime(440, audioCtx.currentTime + 0.5, 1);


var lfo = audioCtx.createOscillator();
lfo.type = 'sine';
lfo.frequency.value = 10;
lfo.start();

var analyser = audioCtx.createAnalyser();
lfo.connect(analyser);

// Create arrays to store sound data
var fFrequencyData = new Float32Array(analyser.frequencyBinCount);
var bFrequencyData = new Uint8Array(analyser.frequencyBinCount);

// Retrieve data
/*
analyser.getByteFrequencyData(bFrequencyData);
analyser.getByteTimeDomainData(bFrequencyData);
*/

var scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
scriptNode.onaudioprocess = function(audioProcessingEvent) {
  analyser.getFloatFrequencyData(fFrequencyData);

  // The input buffer is the song we loaded earlier
  var inputBuffer = audioProcessingEvent.inputBuffer;

  // The output buffer contains the samples that will be modified and played
  var outputBuffer = audioProcessingEvent.outputBuffer;

  // Loop through the output channels (in this case there is only one)
  for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
    var inputData = inputBuffer.getChannelData(channel);
    var outputData = outputBuffer.getChannelData(channel);

    // Loop through the 4096 samples
    for (var sample = 0; sample < inputBuffer.length; sample++) {
      outputData[sample] = inputData[sample] * fFrequencyData[sample % fFrequencyData.length] / 10;
      // console.log(outputData[sample]);
    }
  }
}

// Wiring
osc.connect(volumeNode);
// lfo.connect(volumeNode);
volumeNode.connect(lowPassFilter);
lowPassFilter.connect(scriptNode);
scriptNode.connect(audioCtx.destination);

var tune = [
  [4, 'c', [1, 1]],
  [4, 'd', [1, 1, 2]],
  [4, 'e', [1, 2]],
  [4, 'f', [1, 2, 2]],
  [4, 'g', [1, 3]],
  [4, 'a', [1, 3, 2]],
  [4, 'b', [1, 4]],
  [5, 'c', [2, 1]],
  [5, '-', [2, 2]],
];

play(tune);
