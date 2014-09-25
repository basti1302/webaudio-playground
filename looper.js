'use strict';

var octaves = require('./frequencies').octaves;
var time = require('./time.js');
var t = time.t;

function TuneLooper(input, volume) {
  this.input = input;
  this.volume = volume;
}

TuneLooper.prototype.loop = function loop(tune, reScheduleTimeout) {
  for (var i = 0; i < tune.length; i++) {
    var cmd = tune[i];
    var note = cmd[1];
    var tOffset = t.apply(null, cmd[2]);
    if (note === '-') {
      // this.input.stop(tOffset);
      this.volume.gain.setValueAtTime(0, tOffset);
    } else {
      var octave = cmd[0];
      this.input.frequency.setValueAtTime(octaves[octave][note], tOffset);
      this.volume.gain.setValueAtTime(1, tOffset);
    }
  }

  // schedule another loop when the current loop is about to end, that is, a bit
  // before the last note is played
  var self = this;
  setTimeout(function() {
    time.incrementLoopCounter();
    self.loop(tune, reScheduleTimeout);
  }, reScheduleTimeout);
};

module.exports = TuneLooper;
