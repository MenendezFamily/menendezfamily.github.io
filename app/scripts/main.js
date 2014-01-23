var reliefRatio = 734 / 1170;
var lonRotate = 100;
var latRotate = -45;
var lonCenter = -97.74;
var latTop = 51.75;
var scaleRatio = 1297 / 956.4032697547684;

var width, height;

var dataToLoad = ['at', 'at_buffer', 'momdad', 'momdad_buffer'];
var dataReadyCount = 0;
var reliefReady = false;

var projection = d3.geo.azimuthalEqualArea();

var path = d3.geo.path()
    .projection(projection);

var map = d3.select('#map');
var svg = map.append('svg');
var defs = svg.append('defs');

//
// Load topjson data
// 
d3.json('../data/us.json', function(error, us) {

	defs.append('path')
		.attr('id', 'land')
		.datum(topojson.feature(us, us.objects.land));

	defs.append('filter')
		.attr('id', 'glow')
		.append('feGaussianBlur')
			.attr('in', 'SourceGraphic')
			.attr('stdDeviation', '3');

    svg.append('clipPath')
    	.attr('id', 'clip')
    	.append('use')
    	.attr('xlink:href', '#land');

    svg.insert('image', ':first-child')
    	.attr('class', 'relief')
		.attr('clip-path', 'url(#clip)')
		.attr('xlink:href', '../images/relief.png');

	svg.append('use')
		.attr('xlink:href', '#land');

	reliefReady = true;

	display();

});

dataToLoad.forEach(function(element, index, array) {
	d3.json('../data/' + element + '.json', function(error, data) {
		defs.append('path')
			.attr('id', element)
			.datum(topojson.feature(data, eval('data.objects.' + element)));
		dataReadyCount++;
		display();
	});
});

function display() {
	if (reliefReady && dataReadyCount == dataToLoad.length) {
		// Add paths to map
		svg.append('use')
			.attr('class', 'momdad')
			.attr('xlink:href', '#momdad');

		svg.append('use')
			.attr('class', 'glow momdad')
			.attr('filter', 'url(#glow)')
			.attr('xlink:href', '#momdad');

		svg.append('use')
			.attr('class', 'at')
			.attr('xlink:href', '#at');

		svg.append('use')
			.attr('class', 'glow at')
			.attr('filter', 'url(#glow)')
			.attr('xlink:href', '#at');

		// Add resize event handler and run for the first time
		d3.select(window).on('resize', resize);
		resize();
	}
}

function resize() {

	width = parseInt(map.style('width'));
	height = Math.round(width * reliefRatio);

	projection
	    .rotate([lonRotate, latRotate])
	    .center([lonRotate + lonCenter, latRotate + latTop])
	    .translate([width / 2, 0])
	    .scale(width * scaleRatio)
	    .precision(.1);

	svg
		.attr('width', width)
		.attr('height', height);

	svg.select('.relief')
		.attr('width', width)
		.attr('height', height);

	d3.select(self.frameElement).style('height', height + 'px');

	svg.select('#land').attr('d', path);

	svg.select('#at').attr('d', path);
	svg.select('#momdad').attr('d', path);
		
}
