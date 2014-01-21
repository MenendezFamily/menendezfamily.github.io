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

function resize() {

	if (reliefReady) {

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

		svg.select('#relief')
			.attr('width', width)
			.attr('height', height);

		d3.select(self.frameElement).style("height", height + "px");

		svg.select('#land').attr('d', path);

		if (atReady) svg.select('#at').attr('d', path);
		if (momdadReady) svg.select('#momdad').attr('d', path);
		
	}
}

d3.json("../data/us.json", function(error, us) {

	var defs = svg.append('defs');

	defs.append("path")
		.attr("id", "land")
		.datum(topojson.feature(us, us.objects.land));

    svg.append('clipPath')
    	.attr('id', 'clip')
    	.append('use')
    	.attr('xlink:href', '#land');

    svg.insert("image", ":first-child")
    	.attr('id', 'relief')
		.attr("clip-path", "url(#clip)")
		.attr("xlink:href", "../data/relief.png");

	svg.append("use")
		.attr("xlink:href", "#land");

	reliefReady = true;

	d3.select(window).on('resize', resize);

	resize();

});

d3.json("../data/at.json", function(error, at) {

	svg.append('path')
		.attr('id', 'at')
		.datum(topojson.feature(at, at.objects.at));

	atReady = true;

	resize();

});

d3.json("../data/momdad.json", function(error, momdad) {

	svg.append('path')
		.attr('id', 'momdad')
		.datum(topojson.feature(momdad, momdad.objects.momdad));

	momdadReady = true;

	resize();

});
