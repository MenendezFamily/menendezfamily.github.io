// Map centering variables
var lonRotate = 60;
var latRotate = -10;
var latBottom = 24;

// Map sizing variables
var mapRatio = 0.5;
var maxWidthRatio = 0.6;
var maxHeightRatio = 1.3;
var patternSide = 400;

var width = 0, height = 0, scale = 0;

// Colors from ColorBrewer2
var colors = {
    'red':      '#e41a1c',
    'blue':     '#377eb8',
    'green':    '#4daf4a',
    'purple':   '#984ea3',
    'orange':   '#ff7f00',
    'yellow':   '#ffff33',
    'brown':    '#a65628',
    'pink':     '#f781bf',
};

// Display variables
var defaultStrokeWidth = '3',
    mouseoverStrokeWidth = '5',
    transitionDurationStroke = 300,
    transitionDurationWorld = 1000,
    blurRadius = 3;

// Data loading
var dataToLoad = {
    'at': {
        'url': 'at/',
        'color': colors['brown'],
    },
    'momdad': {
        'url': 'http://mannymarsha.wordpress.com/',
        'color': colors['purple'],
    },
    'transam': {
        'url': 'http://picasaweb.com/nathanbiketrip',
        'color': colors['green'],
    },
    'camino': {
        'url': 'http://blog.travelpod.com/travel-blog/aggiesontheway/2/tpod.html',
        'color': colors['red'],
    },
};
var dataReadyCount = 0;
var baseReady = false;

var map = d3.select('#map');
// var svg = map.append('svg');
// var defs = svg.append('defs');
var canvas = map.append("canvas")  

var c = canvas.node().getContext("2d");

var graticule = d3.geo.graticule();

var projection = d3.geo.orthographic()
    .clipAngle(90);

var path = d3.geo.path()
    .projection(projection)
    .context(c);

// svg.append("path")
//     .datum(graticule)
//     .attr("id", "graticule");
//     

//
// Load topjson data
// 
var land;
d3.json('../data/world-110m.json', function (error, world) {

    // defs.append('path')
    //     .attr('id', 'land')
    //     .datum(topojson.feature(world, world.objects.world));

    // defs.append('pattern')
    //     .attr('id', 'pattern')
    //     .attr('patternUnits', 'userSpaceOnUse')
    //     .attr('width', patternSide)
    //     .attr('height', patternSide)
    //     .append('image')
    //         .attr('xlink:href', '../images/mochaGrunge.png')
    //         .attr('x', '0')
    //         .attr('y', '0')
    //         .attr('width', patternSide)
    //         .attr('height', patternSide);

    // svg.append('use')
    //     .attr('xlink:href', '#land')
    //     .attr('fill', 'url(#pattern)');
    //     
    
    land = topojson.feature(world, world.objects.land);

    baseReady = true;

    display();

});

function loadPathCallback(key) {
    return function (error, data) {
        dataToLoad[key]['feature'] = topojson.feature(data, eval('data.objects.' + key));
        dataReadyCount++;
        display();
    };
}

for (var key in dataToLoad) {
    d3.json('../data/' + key + '.json', loadPathCallback(key));
    // TODO: also load buffer
}

function display() {
   if (baseReady && dataReadyCount === Object.keys(dataToLoad).length) {
        // Add paths to map
        function drawPath(pathName) {
            // var g = svg.append('a')
            //             .attr('xlink:href', dataToLoad[pathName])
            //             .append('g')
            //                 .attr('class', 'path-group ' + pathName);

            // var path = g.append('use')
            //     .attr('class', 'path')
            //     .style('stroke-width', defaultStrokeWidth)
            //     .attr('xlink:href', '#' + pathName);

            // var link = d3.select('.copy .' + pathName);
            // link.style('transition-duration', transitionDuration + 'ms');

            // g.append('use')
            //     .attr('class', 'buffer')
            //     .attr('xlink:href', '#' + pathName + '_buffer');

            // function setPathStroke(width) {
            //     path.transition().duration(transitionDuration).style('stroke-width', width);
            // }

            // function setTextShadow(width) {
            //     var textShadow = '0px 0px ' + width + 'px';
            //     if (width > 0) {
            //         textShadow += ' ' + path.style('stroke');
            //     }
            //     link.style('text-shadow', textShadow);
            // }

            // function doMouseover() {
            //     setPathStroke(mouseoverStrokeWidth);
            //     setTextShadow(blurRadius);
            //     d3.transition()
            //         .tween("rotate", function() {
            //             r = d3.interpolate(projection.rotate(), [100, latRotate]);
            //             return function(t) {
            //                 projection.rotate(r(t));
            //                 svg.select('#momdad').attr('d', window.path);
            //             };
            //         })
            //         .transition();
            // }

            // function doMouseout() {
            //     setPathStroke(defaultStrokeWidth);
            //     setTextShadow(0);
            // }

            // g.on('mouseover', doMouseover);
            // link.on('mouseover', doMouseover);

            // g.on('mouseout', doMouseout);
            // link.on('mouseout', doMouseout);
        }

        // drawPath('momdad');
        // drawPath('transam');
        // drawPath('at');
        // drawPath('camino');

        // Add resize event handler and run for the first time
        d3.select(window).on('resize', resize);
        resize();
    }
}

function resize() {
    // Clear whatever is currently drawn
    c.clearRect(0, 0, width, height);

    // Calculate dimensions to ensure entire page is always visible
    var nonMapHeight = parseInt(d3.select('.container').style('height')) +
                       parseInt(d3.select('#footer').style('height')) +
                       5;

    width = parseInt(map.style('width'));

    height = Math.min(
        Math.round(width * mapRatio),
        window.innerHeight - nonMapHeight
    );

    scale = Math.min(
        width * maxWidthRatio,
        height * maxHeightRatio
    );

    draw([lonRotate, latRotate]);
}

function draw(rotation) {
    projection
        .rotate(rotation)
        .center([0, latRotate + latBottom])
        .scale(scale)
        .translate([width / 2, height]);

    // svg
    //     .attr('width', width)
    //     .attr('height', height);
    //     

    canvas
        .attr("width", width)  
        .attr("height", height);

    d3.select(self.frameElement).style('height', height + 'px');

    // svg.select('#graticule').attr('d', path);
    // svg.select('#land').attr('d', path);

    // for (var key in dataToLoad) {
    //     svg.select('#' + key).attr('d', path);
    // }
    
    // Clear whatever is currently drawn
    c.clearRect(0, 0, width, height);

    c.strokeStyle = '#000', c.lineWidth = 1, c.beginPath(), path(graticule()), c.stroke();
    c.fillStyle = "#bbb", c.beginPath(), path(land), c.fill(), c.stroke();

    for (var key in dataToLoad) {
        c.strokeStyle = dataToLoad[key]['color'], c.lineWidth = defaultStrokeWidth, c.beginPath(), path(dataToLoad[key]['feature']), c.stroke();
    }

    //         c.fillStyle = "#f00", c.beginPath(), path(countries[i]), c.fill();
    //         c.strokeStyle = "#fff", c.lineWidth = .5, c.beginPath(), path(borders), c.stroke();
    //         c.strokeStyle = "#000", c.lineWidth = 2, c.beginPath(), path(globe), c.stroke();
}

function testRotate(lon) {
    lonRotate = lon;

    d3.transition()
        .duration(transitionDurationWorld)
        .tween("rotate", function() {
            r = d3.interpolate(projection.rotate(), [lonRotate, latRotate]);
            return function(t) {
                draw(r(t));
            };
        });
}