var reliefRatio = 734 / 1170;
var lonRotate = 100;
var latRotate = -45;
var lonCenter = -97.74;
var latTop = 51.75;
var scaleRatio = 1297 / 956.4032697547684;

var width, height;

// Data loading
var dataToLoad = {
	'at': 'at/',
	'at_buffer': null,
	'momdad': 'http://mannymarsha.wordpress.com/',
	'momdad_buffer': null,
	};
var dataReadyCount = 0;
var reliefReady = false;

// Display variables
var defaultStrokeWidth = '3';
var mouseoverStrokeWidth ='5';
var transitionDuration = 300;
var blurRadius = '3px';

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

function loadPathCallback(key) {
	return function(error, data) {
		defs.append('path')
			.attr('id', key)
			.datum(topojson.feature(data, eval('data.objects.' + key)));
		dataReadyCount++;
		display();
	};
}

for (var key in dataToLoad) {
	d3.json('../data/' + key + '.json', loadPathCallback(key));
}

function display() {
	if (reliefReady && dataReadyCount == Object.keys(dataToLoad).length) {
		// Add paths to map
		// 
		function drawPath(pathName) {
			var g = svg.append('a')
						.attr('xlink:href', dataToLoad[pathName])
						.append('g')
							.attr('class', 'path-group ' + pathName);

			var path = g.append('use')
				.attr('class', 'path')
				.style('stroke-width', defaultStrokeWidth)
				.attr('xlink:href', '#' + pathName);

			var link = d3.select('.copy .' + pathName);
			link.style('transition-duration', transitionDuration + 'ms');

			g.append('use')
				.attr('class', 'buffer')
				.attr('xlink:href', '#' + pathName + '_buffer');

			function setPathStroke(width) {
				path.transition().duration(transitionDuration).style('stroke-width', width);
			}

			function setTextShadow(width) {
				link.style('text-shadow', '0px 0px ' + width + ' ' + path.style('stroke'));
			}

			function doMouseover() {
				setPathStroke(mouseoverStrokeWidth);
				setTextShadow(blurRadius);
			}

			function doMouseout() {
				setPathStroke(defaultStrokeWidth);
				setTextShadow('0px');
			}

			g.on('mouseover', doMouseover);
			link.on('mouseover', doMouseover);

			g.on('mouseout', doMouseout);
			link.on('mouseout', doMouseout);
		}

		drawPath('momdad');
		drawPath('at');

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

	for (var key in dataToLoad) {
		svg.select('#' + key).attr('d', path);
	}		
}
