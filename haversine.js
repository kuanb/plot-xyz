Number.prototype.toRadians = function () {
   return this * Math.PI / 180;
}

var haversine = function (pointA, pointB) {
	var lat1 = pointA.lat;
	var lat2 = pointB.lat;

	var lon1 = pointA.lng;
	var lon2 = pointB.lng;

	var R = 6371e3; // metres
	var φ1 = lat1.toRadians();
	var φ2 = lat2.toRadians();
	var Δφ = (lat2-lat1).toRadians();
	var Δλ = (lon2-lon1).toRadians();

	var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
	        Math.cos(φ1) * Math.cos(φ2) *
	        Math.sin(Δλ/2) * Math.sin(Δλ/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	var d = R * c;
	return d;
}