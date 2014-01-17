var map = d3.select('#map');

var mapRatio = 0.5;
var width, height;

var projection = d3.geo.conicConformal()
    .rotate([98, 0])
    .center([0, 38])
    .parallels([29.5, 45.5])
    .precision(.1);

var path = d3.geo.path()
    .projection(projection);

var svg = map.append("svg");

function resize() {

	width = parseInt(map.style('width'));
	height = width * mapRatio;

	projection
		.scale(width)
		.translate([width / 2, height / 2]);
	
    svg
    	.attr("width", width)
    	.attr("height", height);

	d3.select(self.frameElement).style("height", height + "px");

	svg.select('.land').attr('d', path);
	
}

d3.select(window).on('resize', resize);

resize();

d3.json("../data/usa.json", function(error, us) {

  svg.append("path")
      .datum(topojson.feature(us, us.objects.subunits))
      .attr("class", "land")
      .attr("d", path);

});
