module.exports = function(audioCtx) {
  'use strict';

  //create the nodes we’ll use
  this.input = audioCtx.createGain();
  var output = audioCtx.createGain(),
      delay = audioCtx.createDelay(),
      feedback = audioCtx.createGain(),
      wetLevel = audioCtx.createGain();

  //set some decent values
  delay.delayTime.value = 0.250;
  feedback.gain.value = 0.4;
  wetLevel.gain.value = 0.35;

  //set up the routing
  this.input.connect(delay);
  this.input.connect(output);
  delay.connect(feedback);
  delay.connect(wetLevel);
  feedback.connect(delay);
  wetLevel.connect(output);

  this.connect = function(target){
    output.connect(target);
  };
};

