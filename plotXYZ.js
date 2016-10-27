function PlotXYZ (settings) {
  this.dimensions = {
    height: settings.dimensions.height,
    width:  settings.dimensions.width
  };
  this.values = settings.values;
};

PlotXYZ.prototype.getBoundingBox = function (buffer) {
  // buffer unit of measurement is 10 meters
  if (!buffer) {
    buffer = 100;
  }

  const vals = this.values.filter(function (ea) {
    if (isNaN(ea.lat) || isNaN(ea.lng)) {
      return false;
    } else {
      return true;
    }
  });

  // credit: obtained via
  // gis.stackexchange.com/questions/172554/calculating-bounding-box-of-given-set-of-coordinates-from-leaflet-draw
  let latitudes = []; 
  let longitudes = []; 

  vals.forEach(function (ea) {
    latitudes.push(ea.lat);
    longitudes.push(ea.lng);
  });

  const minLat = Math.min.apply(null, latitudes);
  const maxLat = Math.max.apply(null, latitudes);
  const minLng = Math.min.apply(null, longitudes);
  const maxLng = Math.max.apply(null, longitudes);

  // TODO: add the buffer into the output bounding box
  return [[minLat, minLng], [maxLat, maxLng]];
};

PlotXYZ.prototype.getMatrixValues = function () {
  const boundingBox = this.getBoundingBox();
  const minLat = boundingBox[0][0];
  const maxLat = boundingBox[1][0];
  const minLng = boundingBox[0][1];
  const maxLng = boundingBox[1][1];

  const width = this.dimensions.width;
  const height = this.dimensions.height;

  const vals = this.values;

  const latChange = (maxLat - minLat)/width;
  const lngChange = (maxLng - minLng)/height;

  let outputValues = [];

  for (var iW = 0; iW < width; iW++) {
    for (var iH = 0; iH < height; iH++) {
      let startLat = minLat + latChange * iW;
      let endLat   = minLat + latChange * (iW + 1);
      let startLng = minLng + lngChange * iH;
      let endLng   = minLng + lngChange * (iH + 1);

      let inRegion = vals.filter(function (ea) {
        if (ea.lat > startLat && 
            ea.lat < endLat && 
            ea.lng > startLng && 
            ea.lng  < endLng) {
          return true;
        } else {
          return false;
        }
      }).map(function (ea) {
        return ea.val;
      });

      if (inRegion.length) {
        let sum = inRegion.reduce(function(a, b) { return a + b; });
        let avg = sum / inRegion.length;
        outputValues.push(avg);
      } else {
        outputValues.push(0);
      }
    }
  }

  return outputValues;
};

PlotXYZ.prototype.getMatrixValues = function () {
  
};
