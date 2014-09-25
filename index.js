'use strict';

var audioCtx = require('./audio_context')();

var scriptNodes = require('./util/script_node_keeper');
var Looper = require('./looper');
var tune = require('./tune');
var time = require('./time');
var t = require('./time').t;

var Delay = require('./fx/delay');

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
lfo.frequency.value = .75;
lfo.start();

var analyser = audioCtx.createAnalyser();
var timeDomainData = new Uint8Array(analyser.frequencyBinCount);
lfo.connect(analyser);

var scriptNode = scriptNodes.keep(audioCtx.createScriptProcessor(1024, 1, 1));

// TODO We use script node as a bloated setInterval, get rid of that
scriptNode.onaudioprocess = function(audioProcessingEvent) {
  // use low analyzer node to control the low pass filter with the lfo
  analyser.getByteTimeDomainData(timeDomainData);
  lowPassFilter.frequency.value = timeDomainData[0] * 20 + 500;
  lowPassFilter.Q.value = timeDomainData[0]/10;

  // pass raw sound data on unaltered
  // TODO Just don't connect the script node, then this should be unnecessary
  var inputBuffer = audioProcessingEvent.inputBuffer;
  var outputBuffer = audioProcessingEvent.outputBuffer;
  for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
    var inputData = inputBuffer.getChannelData(channel);
    var outputData = outputBuffer.getChannelData(channel);
    for (var sample = 0; sample < inputBuffer.length; sample++) {
      outputData[sample] = inputData[sample];
    }
  }
}

// Standard setup: VCO -> VCF -> VCA
osc.connect(volumeNode);
volumeNode.connect(lowPassFilter);
lowPassFilter.connect(scriptNode);
var delay1 = new Delay(audioCtx);
var delay2 = new Delay(audioCtx);
scriptNode.connect(delay1.input);
delay1.connect(delay2.input);
delay2.connect(audioCtx.destination);

time.setStart(audioCtx.currentTime + time.initialDelay);
osc.start(t());
var reScheduleTimeout = t.apply(null, tune[tune.length - 1][2])  * 1000;
new Looper(osc, volumeNode).loop(tune, reScheduleTimeout);

