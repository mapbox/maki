
var data = require('./us-counties.json');

var boxes = [];

for (var i = 0; i < data.features.length; i++) {
	var geometry = data.features[i].geometry;

	if (geometry.type === 'Polygon') {
		boxes.push(toBBox(geometry.coordinates[0]));

	} else if (geometry.type === 'MultiPolygon') {
		for (var j = 0; j < geometry.coordinates; j++) {
			boxes.push(toBBox(geometry.coordinates[j][0]));
		}
	}
}

var fs = require('fs');

// console.log(boxes);

fs.writeFileSync('counties.json', JSON.stringify(boxes));

function toBBox(coords) {

	var minX = Infinity,
		minY = Infinity,
		maxX = -Infinity,
		maxY = -Infinity;

	for (var i = 0; i < coords.length; i++) {
		minX = Math.min(minX, coords[i][0]);
		minY = Math.min(minY, coords[i][1]);
		maxX = Math.max(maxX, coords[i][0]);
		maxY = Math.max(maxY, coords[i][1]);
	}

	return [round(minX), round(minY), round(maxX), round(maxY)];
}

function round(num) {
	var p = 10000;
	return Math.round(num * p) / p;
}
