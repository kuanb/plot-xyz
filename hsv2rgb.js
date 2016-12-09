var generateColor = function(val) {
  // invert val
  val = 100 - val;

  // set defaults
  var mid = 50;
  var red, green, blue = 0;

  // green to yellow
  if (val <= mid) {
    red = Math.floor(255 * (val / mid));
    green = 255;

  // yellow to red
  } else {
    red = 255;
    if (val < 51) val = 51;
    green = Math.floor(255 * ((mid - (val-1) % mid) / mid));
  }

  return `rgb(${red}, ${green}, ${blue})`;
};