/**
 * Created with JetBrains PhpStorm.
 * User: ANDREW
 * Date: 10/1/13
 * Time: 2:11 PM
 * To change this template use File | Settings | File Templates.
 */

window.onload = function () {
	initCanvas(
			document.getElementById('myCanvas'),
			document.getElementById('number_or_colors'),
			document.getElementById('canvas_width'),
			document.getElementById('canvas_height'),
			document.getElementById('draw_form'),
			document.getElementById('ratio')
	);
};

function initCanvas(canvas, colorSelector, inputW, inputH, goBtn, ratioCtl) {

	var viewRatio = 10, viewOffset= {
		x: 10, y: 10
	};

	canvas.width = 1400; // Ширина холста
	canvas.height = 1000; // высота холста


	var lastKnownCoords = { x: 1, y: 1}, colors = 2;
	canvas.addEventListener('mousedown', function (evt) {
		var mousePos = getMousePos(canvas, viewRatio, viewOffset, evt),
				lastKnownCoords = mousePos;
		drawPatterns(canvas, mousePos, colors, viewRatio, viewOffset);
	}, false);

	colorSelector.addEventListener('change', function(){
		colors = colorSelector.value >>> 0;
		drawPatterns(canvas, lastKnownCoords, colors, viewRatio, viewOffset);
	}, false);

	goBtn.addEventListener('submit', function(evt){
		evt.preventDefault();

		var width = inputW.value >>> 0;
		var height = inputH.value >>> 0;
		lastKnownCoords = { x: width, y: height };
		drawPatterns(canvas, lastKnownCoords, colors, viewRatio, viewOffset);
		return false;
	});

	ratioCtl.addEventListener('change', function(){
		viewRatio = ratioCtl.value >>> 0;
		drawPatterns(canvas, lastKnownCoords, colors, viewRatio, viewOffset);
	}, false);

}

function prepareBoard(canvas, coords, ratio, viewOffset) {
	var context = canvas.getContext('2d');
	context.font = "10pt sans-serif";
	context.beginPath();
	//context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "rgb(256,256,256)";
	context.fillRect(0, 0, canvas.width, canvas.height);

	var xStart = viewOffset.x,
			yStart = viewOffset.y;

	var xEnd = viewOffset.x + coords.x * ratio,
			yEnd = viewOffset.y + coords.y * ratio;

	var _gcd = gcd(coords.x, coords.y),_lcm = coords.x * coords.y / _gcd;

	context.beginPath();
	context.strokeStyle = '#444';
	context.strokeText("(" + (coords.x) + ", " + (coords.y) + "), LCM: " + _lcm + ", GCD: " + _gcd, xEnd + 20, yEnd + 20);

	context.moveTo(xStart, yStart);
	context.lineTo(xStart, yEnd);
	context.lineTo(xEnd, yEnd);
	context.lineTo(xEnd, yStart);
	context.lineTo(xStart, yStart);

	context.stroke();

	return context;
}

function gcd(a, b) {
	if (a == b) return a;
	var _a = Math.max(a, b), _b = Math.min(a, b), _an;
	if ((_an =(_a % _b)) == 0) return _b;
	return gcd(_b, _an);
}
function lcm(a, b) {
	return a * b / gcd(a , b);
}

function drawLine(context, style, fromX, fromY, diffX, diffY, ratio, viewOffset) {
	context.beginPath();
	context.strokeStyle = style;
	var x = viewOffset.x + (fromX + ((diffX == 1)? 0 : 1)) * ratio,
			y = viewOffset.y + (fromY + ((diffY == 1)? 0 : 1)) * ratio;

	context.moveTo(x, y + 1.5);
	context.lineTo(
			viewOffset.x + (fromX + ((diffX == 1 ) ? 0 : 1) + diffX) * ratio,
			viewOffset.y + (fromY + ((diffY == 1 ) ? 0 : 1) + diffY) * ratio);

	context.lineTo(x, y - 1.5);
	context.stroke();
}

function drawPatterns(canvas, coords, colorsCount, ratio, viewOffset) {

	var context = prepareBoard(canvas, coords, ratio, viewOffset);

	var xMax = coords.x, yMax = coords.y;

	var colors = [
		'#ffcccc',
		'#123eab',
		'#ffab00',
		'#00cc00',
		'#6f0aaa',
		'#ff4040',
		'#466fd5',
		'#ffc040',
		'#39e639',
		'#9d3ed5'
	];

	var color, coord, ord, even, nd, diff;
	for (var i = 0, max = lcm(xMax, yMax); i < max; i++) {
		color = colors[(i % (colorsCount || 2))];

		coord = {
			x: i % xMax,
			y: i % yMax
		};

		ord = {
			x: Math.floor(i / xMax),
			y: Math.floor(i / yMax)
		};

		even = {
			x: (ord.x % 2) == 0,
			y: (ord.y % 2) == 0
		};

		nd = {
			x: even.x ? coord.x : (xMax -1) - coord.x,
			y: even.y ? coord.y : (yMax - 1) - coord.y
		};

		diff = {
			x: (even.x ? 1 : -1),
			y: (even.y ? 1 : -1)
		};

		drawLine(context, color, nd.x, nd.y, diff.x, diff.y, ratio, viewOffset);
	}
}

function getMousePos(canvas, ratio, offset, evt) {
	var obj = canvas, top = 0, left = 0;
	while (obj && obj.tagName != 'BODY') {
		top += obj.offsetTop;
		left += obj.offsetLeft;
		obj = obj.offsetParent;
	}

	var mouseX = evt.clientX - left + window.pageXOffset,
			mouseY = evt.clientY - top + window.pageYOffset;

	var xMax = Math.round((mouseX - offset.x) / ratio),
			yMax = Math.round((mouseY - offset.y) / ratio);

	return {
		x: xMax,
		y: yMax
	};
}

