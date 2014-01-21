var map = d3.select('#map');

var reliefRatio = 734 / 1170;
var lonRotate = 100;
var latRotate = -45;
var lonCenter = -97.74;
var latTop = 51.75;
var scaleRatio = 1297 / 956.4032697547684;

var width, height;

var reliefReady = false;
var atReady = false;
var momdadReady = false;

var projection = d3.geo.azimuthalEqualArea();

var path = d3.geo.path()
    .projection(projection);

var svg = map.append("svg");
var defs = svg.append('defs');

function display() {
	if (reliefReady && atReady && momdadReady) {
		// Add paths to map
		svg.append("use")
			.attr('class', 'momdad')
			.attr("xlink:href", "#momdad");

		svg.append("use")
			.attr('class', 'at')
			.attr("xlink:href", "#at");

		// Add resize event handler and run for the first time
		d3.select(window).on('resize', resize);

		resize();
	}
}

function resize() {

	width = parseInt(map.style('width'));
	height = width * reliefRatio;

	projection
	    .rotate([lonRotate, latRotate])
	    .center([lonRotate + lonCenter, latRotate + latTop])
	    .translate([width / 2, 0])
	    .scale(width * scaleRatio);

	svg
		.attr("width", width)
		.attr("height", height);

	svg.select('.relief')
		.attr('width', width)
		.attr('height', height);

	d3.select(self.frameElement).style("height", height + "px");

	svg.select('#land').attr('d', path);

	svg.select('#at').attr('d', path);
	svg.select('#momdad').attr('d', path);
		
}

d3.json("../data/us.json", function(error, us) {

	defs.append("path")
		.attr("id", "land")
		.datum(topojson.feature(us, us.objects.land));

	defs.append('filter')
		.attr('id', 'desat')
		.append('feColorMatrix')
			.attr('in', 'SourceGraphic')
			.attr('type', 'saturate')
			.attr('values', '0.3');

	defs.append('filter')
		.attr('id', 'glow')
		.append('feGaussianBlur')
			.attr('in', 'SourceGraphic')
			.attr('stdDeviation', '5');

    svg.append('clipPath')
    	.attr('id', 'clip')
    	.append('use')
    	.attr('xlink:href', '#land');

    svg.insert("image", ":first-child")
    	.attr('class', 'relief')
		.attr("clip-path", "url(#clip)")
		.attr("filter", "url(#desat)")
		.attr("xlink:href", "../data/relief.png");

	svg.append("use")
		.attr("xlink:href", "#land");

	reliefReady = true;

	display();

});

d3.json("../data/at.json", function(error, at) {

		// .attr('class', 'glow')
		// .attr('filter', 'url(#glow)')

	defs.append('path')
		.attr('id', 'at')
		.datum(topojson.feature(at, at.objects.at));

	atReady = true;

	display();

});

d3.json("../data/momdad.json", function(error, momdad) {

	defs.append('path')
		.attr('id', 'momdad')
		.datum(topojson.feature(momdad, momdad.objects.momdad));

	momdadReady = true;

	display();

});
