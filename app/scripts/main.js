// Map centering variables
var lonRotate = -60;
var latRotate = 10;
var latBottom = 24;
var latCenter = 30;

// Map sizing variables
var mapRatio = 0.5;
var maxWidthRatio = 0.6;
var maxHeightRatio = 1.3;

var width = 0, height = 0, scale = 0;

var colors = {
// Colors from ColorBrewer2
    'red':          '#e41a1c',
    'blue':         '#377eb8',
    'green':        '#4daf4a',
    'purple':       '#984ea3',
    'orange':       '#ff7f00',
    'yellow':       '#ffff33',
    'brown':        '#a65628',
    'pink':         '#f781bf',
// Colors from variables.less
    'gray-darker':  '#272B30',
    'gray-dark':    '#3A3F44',
    'gray':         '#52575C',
    'gray-light':   '#7A8288',
    'gray-lighter': '#999',
};

// Display variables
var transitionDurationStroke = 300,
    transitionDurationWorld = 500,
    shadowHeight = 4,
    blurRadius = 3;

var lon = {
    'us': -100,
    'spain': -7,
    'us-edge': -65,
    'spain-edge': -20,
};

var pathStyle = {
    'stroke-width': 3,
    'hover': {
        'stroke-width': 5,
    }
};

var graticuleStyle = {
  'stroke': colors['gray'],
  'stroke-width': 0.5,
};

var landStyle = {
    'stroke': colors['gray'],
    'stroke-width': 1,
    'background-image': loadImage('images/mochaGrunge.png'),
};

// Data loading
var dataToLoad = {
    'at': {
        'url': 'at/',
        'color': colors['brown'],
        'stroke-width': pathStyle['stroke-width'],
        'center-lon': lon['us'],
    },
    'momdad': {
        'url': 'http://mannymarsha.wordpress.com/',
        'color': colors['purple'],
        'stroke-width': pathStyle['stroke-width'],
        'center-lon': lon['us'],
    },
    'transam': {
        'url': 'http://picasaweb.com/nathanbiketrip',
        'color': colors['green'],
        'stroke-width': pathStyle['stroke-width'],
        'center-lon': lon['us'],
    },
    'camino': {
        'url': 'http://blog.travelpod.com/travel-blog/aggiesontheway/2/tpod.html',
        'color': colors['red'],
        'stroke-width': pathStyle['stroke-width'],
        'center-lon': lon['spain'],
    },
};

// Image loading
function loadImage(url) {
    var image = new Image();
    image.src = url;
    return image;
}

// State variables
var isRotating = false;
var firstRun = true;

var map = d3.select('#map');
var canvas = map.append('canvas');
var svg = map.append('svg');

var c = canvas.node().getContext('2d');

var graticule = d3.geo.graticule();

var projection = d3.geo.orthographic()
    .clipAngle(90);

var path = d3.geo.path()
    .projection(projection)
    .context(c);

var svgPath = d3.geo.path()
    .projection(projection);

//
// Load topjson data
// 

// Add helper methods to String
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}
String.prototype.removeRight = function (suffix) {
    return this.substring(0, this.length - suffix.length);
};

var land, borders;

var queue = queue()
    .defer(d3.json, '../data/world-110m.json');

for (var key in dataToLoad) {
    queue.defer(d3.json, '../data/' + key + '.json');
    queue.defer(d3.json, '../data/' + key + '_buffer.json');
}

queue.awaitAll(ready);

function ready(error, results) {
    // Load world data
    var landResult = results.shift();
    land = topojson.feature(landResult, landResult.objects.land);
    borders = topojson.mesh(landResult, landResult.objects.countries, function (a, b) { return a !== b; });

    // Load all other path + buffer data
    results.forEach(function (result) {
        for (var key in result.objects) {
            if (dataToLoad[key]) {
                dataToLoad[key]['feature'] = topojson.feature(result, result.objects[key]);
            }
            else if (key.endsWith('_buffer')) {
                var parentKey = key.removeRight('_buffer');
                if (dataToLoad[parentKey]) {
                    dataToLoad[parentKey]['buffer'] = topojson.feature(result, result.objects[key]);
                }
            }
        }
    });

    // Draw buffers on svg
    drawBuffer('momdad');
    drawBuffer('transam');
    drawBuffer('at');
    drawBuffer('camino');

    // Add resize event handler and run for the first time
    d3.select(window).on('resize', resize);
    resize();

    // Add mousemove event handler for auto rotation
    svg.on('mousemove', function () {
        if (!isRotating) {
            if ( lonRotate === lon['us'] &&
                 d3.event.clientX > projection([lon['us-edge'], latCenter])[0] ) {
                // Scroll to Spain
                rotate(lon['spain']);
            }
            else if ( lonRotate === lon['spain'] &&
                      d3.event.clientX < projection([lon['spain-edge'], latCenter])[0] ) {
                // Scroll to US
                rotate(lon['us']);
            }
            else if ( lonRotate !== lon['us'] && lonRotate !== lon['spain'] ) {
                if ( d3.event.clientX < (width / 2) ) {
                    // Scroll to US
                    rotate(lon['us']);
                }
                else {
                    // Scroll to Spain
                    rotate(lon['spain']);
                }
            }
        }
    });
}

function drawBuffer(pathName) {
    dataToLoad[pathName]['buffer-element'] = svg.append('a')
                                                .attr('class', 'buffer')
                                                .attr('xlink:href', dataToLoad[pathName]['url'])
                                                .append('path')
                                                    .datum(dataToLoad[pathName]['buffer']);

    dataToLoad[pathName]['link-element'] = d3.select('.copy .' + pathName);
    dataToLoad[pathName]['link-element'].style('transition-duration', transitionDurationStroke + 'ms');

    function doMouseoverBuffer() {
        doMouseover(pathName, false);
    }

    function doMouseoverLink() {
        doMouseover(pathName, true);
    }

    function doMouseout() {
        if (!isRotating) {
            setPathStroke(pathName, pathStyle['stroke-width']);
        }
        setTextShadow(pathName, 0);
    }

    // Add event handlers to svg buffers and to html links
    dataToLoad[pathName]['buffer-element'].on('mouseover', doMouseoverBuffer);
    dataToLoad[pathName]['link-element'].on('mouseover', doMouseoverLink);

    dataToLoad[pathName]['buffer-element'].on('mouseout', doMouseout);
    dataToLoad[pathName]['link-element'].on('mouseout', doMouseout);
}

function setPathStroke(pathName, width) {
    d3.transition()
        .duration(transitionDurationStroke)
        .tween('width', function() {
            var w = d3.interpolate(dataToLoad[pathName]['stroke-width'], width);
            return function(t) {
                dataToLoad[pathName]['stroke-width'] = w(t);
                draw();
            };
        });
}

function setTextShadow(pathName, width) {
    var textShadow = '0px 0px ' + width + 'px';
    if (width > 0) {
        textShadow += ' ' + dataToLoad[pathName]['color'];
    }
    dataToLoad[pathName]['link-element'].style('text-shadow', textShadow);
}

function doMouseover(pathName, fromLink) {
    if (!isRotating || fromLink) {
        resetPathStrokes();
        if (!isRotating) {
            setPathStroke(pathName, pathStyle['hover']['stroke-width']);
        }
        rotate(dataToLoad[pathName]['center-lon'], fromLink ? pathName : null);
    }
    setTextShadow(pathName, blurRadius);
}

function resize() {
    // Clear whatever is currently drawn
    c.clearRect(0, 0, width, height);

    // Calculate dimensions to ensure entire page is always visible
    var nonMapHeight = parseInt(d3.select('.container').style('height'), 10) +
                       parseInt(d3.select('#footer').style('height'), 10);

    width = parseInt(map.style('width'), 10);

    height = Math.min(
        Math.round(width * mapRatio),
        window.innerHeight - nonMapHeight
    );

    scale = Math.min(
        width * maxWidthRatio,
        height * maxHeightRatio
    );

    draw();
    drawSvg();
}

function draw() {
    projection
        .rotate([-lonRotate, -latRotate])
        .center([0, latBottom - latRotate])
        .scale(scale)
        .translate([width / 2, height]);

    canvas
        .attr('width', width)
        .attr('height', height);

    // Add ready class to canvas to draw background and border
    if (firstRun) {
        firstRun = false;
        canvas.attr('class', 'ready');
    }

    map.style('height', height + 'px');
    
    // Clear whatever is currently drawn
    c.clearRect(0, 0, width, height);

    c.strokeStyle = graticuleStyle['stroke'],
        c.lineWidth = graticuleStyle['stroke-width'],
        c.beginPath(),
        path(graticule()),
        c.stroke();
    c.fillStyle = c.createPattern(landStyle['background-image'], 'repeat'),
        c.strokeStyle = landStyle['stroke'],
        c.lineWidth = landStyle['stroke-width'],
        c.beginPath(),
        path(land),
        c.fill(),
        c.stroke();
    c.beginPath(),
        path(borders),
        c.stroke();

    for (var key in dataToLoad) {
        c.strokeStyle = dataToLoad[key]['color'],
            c.lineWidth = dataToLoad[key]['stroke-width'],
            c.beginPath(), path(dataToLoad[key]['feature']),
            c.stroke();
    }

    // Draw shadow on canvas bottom
    var shadow = c.createLinearGradient(0, height - shadowHeight, 0, height + shadowHeight);
    shadow.addColorStop(0, 'transparent');
    shadow.addColorStop(1, colors['gray-dark']);
    c.fillStyle = shadow,
        c.fillRect(0, height - shadowHeight, width, height);
}

function drawSvg() {
    svg
        .attr('width', width)
        .attr('height', height);

    // Redraw SVG buffers
    for (var key in dataToLoad) {
        dataToLoad[key]['buffer-element'].attr('d', svgPath);
    }
}

function rotate(to, pathName) {
    var from = -projection.rotate()[0];
    if (from !== to) {
        isRotating = true; // Disable all mouse events
        resetPathStrokes(); // Set all strokes to default width

        // If this rotate was caused by link mouseover, set stroke to hovered width
        if (pathName) {
            dataToLoad[pathName]['stroke-width'] = pathStyle['hover']['stroke-width'];
        }

        d3.transition()
            .duration(transitionDurationWorld)
            .tween('rotate', function () {
                var r = d3.interpolate(from, to);
                return function (t) {
                    lonRotate = r(t);
                    draw();
                };
            })
            .each('end', function () {
                isRotating = false; // Enable events
                drawSvg(); // Move the invisible SVG buffers into place
            });
    }
}

function resetPathStrokes() {
    for (var key in dataToLoad) {
        dataToLoad[key]['stroke-width'] = pathStyle['stroke-width'];
    }
    draw();
}
