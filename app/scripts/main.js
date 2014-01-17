var width = 960,
    height = 500;

var projection = d3.geo.conicConformal()
    .rotate([98, 0])
    .center([0, 38])
    .parallels([29.5, 45.5])
    .scale(1000)
    .translate([width / 2, height / 2])
    .precision(.1);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("../data/usa.json", function(error, us) {
  svg.append("path")
      .datum(topojson.feature(us, us.objects.subunits))
      .attr("class", "land")
      .attr("d", path);

});

d3.select(self.frameElement).style("height", height + "px");