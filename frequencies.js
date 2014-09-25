'use strict';

/* constants for calculation of frequencies */
var twelvthRootOfTwo = 1.059463094;

/* precalculated tones */
var octaves = [];
exports.octaves = octaves;

function calculateFrequency(n) {
  return 440 * Math.pow(twelvthRootOfTwo, (n - 49));
}

(function precalculateFrequencies() {
  var minOctave = 0;
  var maxOctave = 10;
  var toneNames = [[null, 'c',  'c#', 'd',  'd#', 'e',  'f',   'f#', 'g',  'g#', 'a',  'a#', 'b',  null],
                   [null, null, null, null, null, null,  'e#', null, null, null, null, null, null, 'b#'],
                   [null, null, 'c♯', null, 'd♯', null,  'e♯', 'f♯', null, 'g♯', null, 'a♯', null, 'b♯'],
                   ['c♭', null, 'd♭', null, 'e♭', 'f♭',  null, 'g♭', null, 'a♭', null, 'b♭', null, null],
                   ['cb', null, 'db', null, 'eb', 'fb',  null, 'gb', null, 'ab', null, 'bb', null, null],
                  ];

  for (var o = minOctave; o < maxOctave; o++) {
    var octave = {};
    octaves[o] = octave;
    for (var t = 0; t < 14; t++) {
      var n = o * 12 + t - 9 ;
      var frequency = calculateFrequency(n);
      // assign frequeny to all aliases of the tone name
      // (for example, g# = g♯ = a♭ = ab)
      for (var i = 0; i < toneNames.length; i++) {
        var toneName = toneNames[i][t];
        if (toneName !== null) {
          octave[toneName] = frequency;
        }
      }
    }
  }
})();


