/**
 * Created with JetBrains PhpStorm.
 * User: ANDREW
 * Date: 10/1/13
 * Time: 2:11 PM
 * To change this template use File | Settings | File Templates.
 */

window.onload = function () {
	initCanvas({
		canvas: document.getElementById('myCanvas'),
		colorSelector: document.getElementById('number_or_colors'),
		inputW: document.getElementById('canvas_width'),
		inputH: document.getElementById('canvas_height'),
		goBtn: document.getElementById('draw_form'),
		ratioCtl: document.getElementById('ratio'),
		alternateColors: document.getElementById('alternate_colors')
	});
};

function initCanvas(o) {

	var canvas = o.canvas,
			colorSelector = o.colorSelector,
			inputW = o.inputW,
			inputH = o.inputH,
			goBtn = o.goBtn,
			ratioCtl = o.ratioCtl,
			alternateColors = o.alternateColors;

	var viewRatio = 10, viewOffset= {
		x: 10, y: 10
	};

	canvas.width = 1400; // Ширина холста
	canvas.height = 1000; // высота холста


	var lastKnownCoords = { x: 1, y: 1}, colors = 2, alternate = false;

	canvas.addEventListener('mousedown', function (evt) {
		var mousePos = getMousePos(canvas, viewRatio, viewOffset, evt);

		lastKnownCoords.x = mousePos.x;
		lastKnownCoords.y = mousePos.y;

		drawPatterns(canvas, lastKnownCoords, colors, viewRatio, viewOffset, alternate);
	}, false);

	colorSelector.addEventListener('change', function(){
		colors = colorSelector.value >>> 0;
		drawPatterns(canvas, lastKnownCoords, colors, viewRatio, viewOffset, alternate);
	}, false);

	goBtn.addEventListener('submit', function(evt){
		evt.preventDefault();
		var width = inputW.value >>> 0;
		var height = inputH.value >>> 0;
		lastKnownCoords.x = width;
		lastKnownCoords.y = height;
		drawPatterns(canvas, lastKnownCoords, colors, viewRatio, viewOffset, alternate);
		return false;
	});

	ratioCtl.addEventListener('change', function(){
		viewRatio = ratioCtl.value >>> 0;
		drawPatterns(canvas, lastKnownCoords, colors, viewRatio, viewOffset, alternate);
	}, false);

	alternateColors.addEventListener('change', function(){
		alternate = alternateColors.checked === true;
		drawPatterns(canvas, lastKnownCoords, colors, viewRatio, viewOffset, alternate);
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
function drawLineNew(context, style, fromX, fromY, direction, ratio, viewOffset) {
	context.beginPath();
	context.strokeStyle = style;
	var diffX = direction % 2, diffY = Math.floor(direction / 2)
	var x = viewOffset.x + (fromX + diffX) * ratio,
			y = viewOffset.y + (fromY + diffY) * ratio;

	context.moveTo(x, y + 1.5);
	context.lineTo(
			viewOffset.x + (fromX + diffX + ((diffX === 0 ) ? 1 : -1)) * ratio,
			viewOffset.y + (fromY + diffY + ((diffY === 0 ) ? 1 : -1)) * ratio);

	context.lineTo(x, y - 1.5);
	context.stroke();
}

function prepareModel(xMax, yMax) {
	var result = [];
	var moduloCoords, wholePartCoords, isEvenPair, reflectedCoords, directionPair;
	for (var i = 0, max = lcm(xMax, yMax); i < max; i++) {
		moduloCoords = {
			x: i % xMax,
			y: i % yMax
		};

		wholePartCoords = {
			x: Math.floor(i / xMax),
			y: Math.floor(i / yMax)
		};

		isEvenPair = {
			x: (wholePartCoords.x % 2) == 0,
			y: (wholePartCoords.y % 2) == 0
		};

		reflectedCoords = {
			x: isEvenPair.x ? moduloCoords.x : (xMax -1) - moduloCoords.x,
			y: isEvenPair.y ? moduloCoords.y : (yMax - 1) - moduloCoords.y
		};

		directionPair = {
			x: (isEvenPair.x ? 1 : -1),
			y: (isEvenPair.y ? 1 : -1)
		};
		var key = reflectedCoords.x + yMax * reflectedCoords.y;
		if (result[key]) {
			debugger;
		}
		result[key] = {
			slant: directionPair.x * directionPair.y == 1 ? '\\' : '/',
			direction: (isEvenPair.x ? 0 : 1) + (isEvenPair.y ? 0 : 2),
			idx: i
		};
	}
	return result;
}

function drawPatterns(canvas, coords, colorsCount, ratio, viewOffset, alternate) {

	var context = prepareBoard(canvas, coords, ratio, viewOffset);



	var xMax = coords.x, yMax = coords.y;
	var model = prepareModel(xMax, yMax);

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

	var item;
	var color, colorKey;
	debugger;
	for (var i = 0, max = model.length; i < max; i++) {
		item = model[i];
		if (!item) continue;
		var x = i % yMax, y = Math.floor(i / yMax);
		colorKey = (item.idx % (colorsCount || 2));
		color = ((alternate)
				? colors[Math.floor(colorKey / 2) * 2 + (1 - (colorKey % 2))]
				: colors[colorKey]);
		drawLineNew(context, color, x, y, item.direction, ratio, viewOffset);
	}

//	var color, coord, ord, even, nd, diff, colorKey;
//	for (var i = 0, max = lcm(xMax, yMax); i < max; i++) {
//
//		colorKey = (i % (colorsCount || 2));
//
//		color = ((alternate)
//				? colors[Math.floor(colorKey / 2) * 2 + (1 - (colorKey % 2))]
//				: colors[colorKey]);
//
//		coord = {
//			x: i % xMax,
//			y: i % yMax
//		};
//
//		ord = {
//			x: Math.floor(i / xMax),
//			y: Math.floor(i / yMax)
//		};
//
//		even = {
//			x: (ord.x % 2) == 0,
//			y: (ord.y % 2) == 0
//		};
//
//		nd = {
//			x: even.x ? coord.x : (xMax -1) - coord.x,
//			y: even.y ? coord.y : (yMax - 1) - coord.y
//		};
//
//		diff = {
//			x: (even.x ? 1 : -1),
//			y: (even.y ? 1 : -1)
//		};
//
//		drawLine(context, color, nd.x, nd.y, diff.x, diff.y, ratio, viewOffset);
//	}
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

