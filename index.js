// ScriptProcessorNodes need to be global. See
// http://sriku.org/blog/2013/01/30/taming-the-scriptprocessornode/
var scriptNodes = {};
var keep = (function () {
  var nextNodeID = 1;
  return function (node) {
    node.id = node.id || (nextNodeID++);
    scriptNodes[node.id] = node;
    return node;
  };
}());

(function() {

var twelvthRootOfTwo = 1.059463094;

var minOctave = 0;
var maxOctave = 10;

function calculateFrequency(n) {
  // using equal temperament
  return 440 * Math.pow(twelvthRootOfTwo, (n - 49));
}

var toneNames = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];

// precalculate frequencies
var octaves = [];
for (var o = minOctave; o < maxOctave; o++) {
  var octave = {};
  octaves[o] = octave;
  for (var t = 0; t < 12; t++) {
    var n = o * 12 + t - 8 ;
    octave[toneNames[t]] = calculateFrequency(n);
  }
}

var timerStart;
var bpm = 120;
var beats = 4;
var initialDelay = .1;

var loopBars = 4;
var currentLoop = 0;

function calculateTime(bar, beat, eigth, sixteenth, thirtytwoth) {
  if (typeof bar === 'undefined') { bar = 1 };
  if (typeof beat === 'undefined') { beat = 1 };
  if (typeof eigth === 'undefined') { eigth = 1 };
  if (typeof sixteenth === 'undefined') { sixteenth = 1 };
  if (typeof thirtytwoth === 'undefined') { thirtytwoth = 1 };
  return timerStart + (
      currentLoop * loopBars * beats +
      (bar-1) * beats +
      (beat-1) +
      ((eigth-1) / 2) +
      ((sixteenth-1) / 4) +
      ((thirtytwoth-1) / 8)
    ) * 60 / bpm;
}
var t = calculateTime;

var audioCtx;
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
/*
lowPassFilter.frequency.setTargetAtTime(500, audioCtx.currentTime + 1, 2);
lowPassFilter.frequency.setTargetAtTime(2000, audioCtx.currentTime + 2, 3);
lowPassFilter.frequency.setTargetAtTime(500, audioCtx.currentTime + 3, 4);
*/

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

var scriptNode = keep(audioCtx.createScriptProcessor(4096, 1, 1));
var volumes = [.4, .5, .6, .7, .8, .9, 1, .9, .8, .7, .6, .5, .4];
var volIndex = -1;
scriptNode.onaudioprocess = function(audioProcessingEvent) {
  volIndex = (volIndex + 1) % volumes.length;
  analyser.getFloatFrequencyData(fFrequencyData);
  var inputBuffer = audioProcessingEvent.inputBuffer;
  var outputBuffer = audioProcessingEvent.outputBuffer;
  for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
    var inputData = inputBuffer.getChannelData(channel);
    var outputData = outputBuffer.getChannelData(channel);
    for (var sample = 0; sample < inputBuffer.length; sample++) {
      // outputData[sample] = inputData[sample] * fFrequencyData[sample % fFrequencyData.length] / 10;
      outputData[sample] = inputData[sample] * volumes[volIndex];
      // outputData[sample] = inputData[sample];
    }
  }
}

osc.connect(volumeNode);
volumeNode.connect(lowPassFilter);
lowPassFilter.connect(scriptNode);
scriptNode.connect(audioCtx.destination);

function play(tune) {
  timerStart = audioCtx.currentTime + initialDelay;
  osc.start(t());
  var reScheduleTimeout = t.apply(null, tune[tune.length - 1][2])  * 1000;
  loop(tune, reScheduleTimeout);
};

function loop(tune, reScheduleTimeout) {
  for (var i = 0; i < tune.length; i++) {
    var cmd = tune[i];
    var note = cmd[1];
    var time = t.apply(null, cmd[2]);
    if (note === '-') {
      // osc.stop(time);
      volumeNode.gain.setValueAtTime(0, time);
    } else {
      var octave = cmd[0];
      osc.frequency.setValueAtTime(octaves[octave][note], time);
      volumeNode.gain.setValueAtTime(1, time);
    }
  }

  // schedule another loop when the current loop is about to end, that is, a bit
  // before the last note is played
  setTimeout(function() {
    currentLoop++;
    loop(tune, reScheduleTimeout);
  }, reScheduleTimeout);
}

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
  [5, 'c', [2, 2, 2]],
  [5, '-', [2, 2, 2, 2]],
  [5, 'c', [2, 3]],
  [5, '-', [2, 4]],

  [5, 'c', [3, 1]],
  [4, 'b', [3, 1, 2]],
  [4, 'a', [3, 2]],
  [4, 'g', [3, 2, 2]],
  [4, 'f', [3, 3]],
  [4, 'e', [3, 3, 2]],
  [4, 'd', [3, 4]],
  [4, 'c', [4, 1]],
  [4, '-', [4, 1, 1, 3]],
  [4, 'e', [4, 2]],
  [4, 'd', [4, 2, 2]],
  [4, 'c', [4, 3]],
  [4, '-', [4, 4, 2]],
];

play(tune);

})();
