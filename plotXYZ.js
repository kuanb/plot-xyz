'use strict'

class PlotXYZ {

  constructor(settings) {
    this._settings = settings;

    this.dimensions = {
      height: settings.dimensions.height,
      width:  settings.dimensions.width
    };

    this.values = settings.values.map((ea) => {
      return PlotXYZ._getSinglePoint(ea);
    });
  }

  static _getSinglePoint(point) {
    const lat = Number(point.lat);
    const lng = Number(point.lng);
    const val = Number(point.val);
    return {lat: lat, lng: lng, val: val};
  }

  getValues() {
    return this.values;
  }

  getGeoJSON() {
    let layer = L.geoJSON();
    this.values.forEach((ea) => {
      let feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [ea.lng, ea.lat]
        }
      };
      layer.addData(feature);
    });
    return layer;
  }

  getMatrix(resolution=100, buffer=0) {
    const bounds = this.getBoundingBox(buffer);

    // lets get the grid system length, height parameters
    bounds.height = Math.abs(bounds.northwest.lat - bounds.southwest.lat);
    bounds.width = Math.abs(bounds.northwest.lng - bounds.northeast.lng);

    let largestDirection = bounds.height >= bounds.width ? 'height' : 'width';
    let smallestDirection = bounds.height < bounds.width ? 'height' : 'width';
    let blockSideLength = bounds[largestDirection]/resolution;

    let widthCount = Math.ceil(largestDirection == 'width' ? bounds[largestDirection]/blockSideLength : bounds[smallestDirection]/blockSideLength);
    let heightCount = Math.ceil(largestDirection == 'height' ? bounds[largestDirection]/blockSideLength : bounds[smallestDirection]/blockSideLength);

    // now lets create a matric of GeoJSONs according to that grid
    let resultingMatrix = [];
    for (var iH = 0; iH < heightCount; iH++) {
      let oneRow = [];

      for (var iW = 0; iW < widthCount; iW++) {
        let n = bounds.northwest.lat - (iH * blockSideLength);
        let e = bounds.northwest.lng + ((iW + 1) * blockSideLength);
        let w = bounds.northwest.lng + (iW * blockSideLength);
        let s = bounds.northwest.lat - ((iH + 1) * blockSideLength);
        let feature = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[ [w, n], [e, n], [e, s], [w, s], [w, n], ]]
          }
        };
        oneRow.push(feature);
      }

      resultingMatrix.push(oneRow);
    }

    // now let's determine the value for each of these GeoJSONs
    resultingMatrix = resultingMatrix.map((row) => {

      console.log('row', L.geoJSON(row).getBounds());
      let rowBounds = L.geoJSON(row).getBounds();

      let bounds = L.geoJSON(cell).getBounds();
      let onesInRow = this.values.filter((value) => {
        let point = L.latLng(value);
        return bounds.contains(point);
      });

      row = row.map((cell) => {
        // check which of the points are in each
        let StartMilliseconds = new Date().getTime();
        let bounds = L.geoJSON(cell).getBounds();
        let onesInside = this.values.filter((value) => {
          let point = L.latLng(value);
          return bounds.contains(point);
        });
        let ElapsedMilliseconds = new Date().getTime() - StartMilliseconds;
        console.log('elapsed', ElapsedMilliseconds/1000);

        let average = 0;
        if (onesInside.length) {
          onesInside.forEach((ea) => {
            if (!isNaN(ea.val)) {
              average += Number(ea.val);
            }
          });
          average = average/onesInside.length;
        }
        if (!cell.properties) cell.properties = {};
        cell.properties.val = average;
        return cell;
      });

      return row;
    })

    return resultingMatrix;

    // const minLat = boundingBox[0][0];
    // const maxLat = boundingBox[1][0];
    // const minLng = boundingBox[0][1];
    // const maxLng = boundingBox[1][1];

    // const width = this.dimensions.width;
    // const height = this.dimensions.height;

    // const vals = this.values;
    // const latChange = (maxLat - minLat)/width;
    // const lngChange = (maxLng - minLng)/height;

    // let outputValues = [];

    // for (var iW = 0; iW < width; iW++) {
    //   for (var iH = 0; iH < height; iH++) {
    //     let startLat = minLat + latChange * iW;
    //     let endLat   = minLat + latChange * (iW + 1);
    //     let startLng = minLng + lngChange * iH;
    //     let endLng   = minLng + lngChange * (iH + 1);

    //     let inRegion = vals.filter(function (ea) {
    //       if (ea.lat > startLat && 
    //           ea.lat < endLat && 
    //           ea.lng > startLng && 
    //           ea.lng  < endLng) {
    //         return true;
    //       } else {
    //         return false;
    //       }
    //     }).map(function (ea) {
    //       return ea.val;
    //     });

    //     if (inRegion.length) {
    //       let sum = inRegion.reduce(function(a, b) { return a + b; });
    //       let avg = sum / inRegion.length;
    //       outputValues.push(avg);
    //     } else {
    //       outputValues.push(0);
    //     }
    //   }
    // }

    // return outputValues;
  }

  getBoundingBox(buffer=0) {
    // pads bounding box shape by set percentage
    buffer = Number(buffer);
    if (isNaN(buffer)) buffer = 0;

    let bounds = this.getGeoJSON().getBounds().pad(buffer);
    let corners = {
      northwest: bounds.getNorthWest(),
      northeast: bounds.getNorthEast(),
      southeast: bounds.getSouthEast(),
      southwest: bounds.getSouthWest(),
    }
    return corners;
  }

}