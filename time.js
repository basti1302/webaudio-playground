'use strict';

var start = 0;
var bpm = 130;
var beats = 4;

var loopBars = 4;
var currentLoop = 0;

exports.initialDelay = .1;

exports.t = function calculateTime(
  bar,
  beat,
  eigth,
  sixteenth,
  thirtytwoth
) {
  if (typeof bar === 'undefined') { bar = 1 };
  if (typeof beat === 'undefined') { beat = 1 };
  if (typeof eigth === 'undefined') { eigth = 1 };
  if (typeof sixteenth === 'undefined') { sixteenth = 1 };
  if (typeof thirtytwoth === 'undefined') { thirtytwoth = 1 };
  return start + (
      currentLoop * loopBars * beats +
      (bar-1) * beats +
      (beat-1) +
      ((eigth-1) / 2) +
      ((sixteenth-1) / 4) +
      ((thirtytwoth-1) / 8)
    ) * 60 / bpm;
};

exports.setStart = function(_start) {
  start = _start;
};

exports.incrementLoopCounter = function() {
  currentLoop++;
};
