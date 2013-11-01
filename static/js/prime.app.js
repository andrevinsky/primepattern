/**
 * Created with JetBrains PhpStorm.
 * User: ANDREW
 * Date: 10/1/13
 * Time: 2:11 PM
 * To change this template use File | Settings | File Templates.
 */

$(function () {
	initCanvas({
		canvas: $('#myCanvas'),
		colorSelector: $('#number_or_colors'),
		inputW: $('#canvas_width'),
		inputH: $('#canvas_height'),
		dimensions: $('#draw_form'),
		ratioCtl: $('#ratio'),
		fill: $('#fill_colors'),
		outline: $('#outline_fill'),
		alternateColors: $('#alternate_colors'),
		swapper: $('#swap_sides'),
		reduce: $('#reduce_sides'),
		increase: $('#increase_sides')
	}, {
		canvas: { width: 1400, height: 1000 },
		colors: 2,
		patternSize: { width: 15, height: 8},
		ratio: 10,
		fill: false,
		outline: false,
		alternate: false,
		viewOffset: {
			x: 10,
			y: 10
		},
		colorBank: [
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
		]
	});
});

function initCanvas(view, model) {

	view.canvas[0].width = model.canvas.width;
	view.canvas[0].height = model.canvas.height;
	view.canvas.on('mousedown', function (evt) {
		var mousePos = getMousePos(view.canvas[0], model, evt);

		model.patternSize.width = mousePos.x;
		model.patternSize.height = mousePos.y;

		view.inputW.val(model.patternSize.width);
		view.inputH.val(model.patternSize.height);

		drawPatterns(view.canvas, model);
	});

	view.colorSelector.val(model.colors).on('change', function(){
		model.colors = $(this).val() >>> 0;
		drawPatterns(view.canvas, model);
	});

	view.ratioCtl.val(model.ratio).on('change', function(){
		model.ratio = $(this).val() >>> 0;
		drawPatterns(view.canvas, model);
	});

	view.alternateColors.prop('checked', model.alternate).on('change', function(){
		model.alternate = $(this).is(':checked');
		drawPatterns(view.canvas, model);
	});

	view.fill.prop('checked', model.fill).on('change', function(){
		model.fill = $(this).is(':checked');
		drawPatterns(view.canvas, model);
	});

	view.outline.prop('checked', model.outline).on('change', function(){
		model.outline = $(this).is(':checked');
		drawPatterns(view.canvas, model);
	});


	view.inputW.val(model.patternSize.width);
	view.inputH.val(model.patternSize.height);
	view.dimensions.on('submit', function(evt){
		evt.preventDefault();
		model.patternSize.width = view.inputW.val() >>> 0;
		model.patternSize.height = view.inputH.val() >>> 0;
		drawPatterns(view.canvas, model);
		return false;
	});

	view.swapper.on('click', function(){
		var tmp = model.patternSize.width;
		model.patternSize.width = model.patternSize.height;
		model.patternSize.height = tmp;

		view.inputW.val(model.patternSize.width);
		view.inputH.val(model.patternSize.height);

		drawPatterns(view.canvas, model);
	});

	view.reduce.on('click', function(){
		var min = Math.min(model.patternSize.width, model.patternSize.height),
				max = Math.max(model.patternSize.width, model.patternSize.height),
				diff = max - min;
		if (min == max) {
			return;
		}
		if (diff <= 1) {
			return;
		}
		model.patternSize.width = Math.max(min, diff);
		model.patternSize.height = Math.min(min, diff);

		view.inputW.val(model.patternSize.width);
		view.inputH.val(model.patternSize.height);

		drawPatterns(view.canvas, model);
	});
	view.increase.on('click', function(){
		var min = Math.min(model.patternSize.width, model.patternSize.height),
				max = Math.max(model.patternSize.width, model.patternSize.height),
				next = max + min;

		model.patternSize.width = next;
		model.patternSize.height = max;

		view.inputW.val(model.patternSize.width);
		view.inputH.val(model.patternSize.height);

		drawPatterns(view.canvas, model);
	});

	drawPatterns(view.canvas, model);
}

function prepareBoard(canvas, model) {
	var context = canvas.getContext('2d'),
			coords = {
				x: model.patternSize.width,
				y: model.patternSize.height
			},
			ratio = model.ratio,
			viewOffset = model.viewOffset;

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
	context.textAlign="right";
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
			x: isEvenPair.x ? moduloCoords.x : (xMax - 1) - moduloCoords.x,
			y: isEvenPair.y ? moduloCoords.y : (yMax - 1) - moduloCoords.y
		};

		directionPair = {
			x: (isEvenPair.x ? 1 : -1),
			y: (isEvenPair.y ? 1 : -1)
		};
		var key = reflectedCoords.x + xMax * reflectedCoords.y;
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

function drawPatterns($canvas, model) {

	var canvas = $canvas[0],
			context = prepareBoard(canvas, model),
			coords = model.patternSize,
			colorsCount = model.colors,
			ratio = model.ratio,
			viewOffset = model.viewOffset,
			alternate = model.alternate,
			doFill = model.fill,
			outlineOnly = model.outline,
			colors = model.colorBank;

	var xMax = coords.width, yMax = coords.height;

	var patternModel = prepareModel(xMax, yMax);

	if (doFill) {
		var cBank = [colors[0],colors[1]];
		var currentRowColor = 0, currentColor = 0;
		for (var y = 0; y < yMax; y++) {
			currentColor = currentRowColor;
			for (var x = 0; x < xMax; x++) {
				var key = x + xMax * y, token = patternModel[key];
				if (outlineOnly && !token) {
					drawSolidBox(context, cBank[currentColor], x, y, ratio, viewOffset);
				} else {
					if (token && (alternate ? ((token.idx % 2) == 0) : ((token.idx % 2) == 1))) {
						if ((x == 0) && (token.slant == '\\')) {
							currentRowColor = currentColor = 1 - currentRowColor;
						}
						drawHalfBox(context, cBank[currentColor], cBank[1 - currentColor], x, y, token, ratio, viewOffset);
						currentColor = 1 - currentColor;
						if ((x == 0) && (token.slant == '/')) {
							currentRowColor = 1 - currentRowColor;
						}
					} else {
						drawSolidBox(context, cBank[currentColor], x, y, ratio, viewOffset);
					}
				}
			}
		}

	} else {
		var item, color, colorKey;
		for (var i = 0, max = patternModel.length; i < max; i++) {
			item = patternModel[i];
			if (!item) continue;
			var x = i % xMax, y = Math.floor(i / xMax);
			colorKey = (item.idx % (colorsCount || 2));
			color = ((alternate)
					? colors[Math.floor(colorKey / 2) * 2 + (1 - (colorKey % 2))]
					: colors[colorKey]);
			drawLineNew(context, color, x, y, item.direction, ratio, viewOffset);
		}
	}
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

function drawSolidBox(context, style, x, y, ratio, viewOffset) {
	context.beginPath();
	context.fillStyle = style;
	context.fillRect(viewOffset.x + x * ratio, viewOffset.y + y * ratio, ratio, ratio);
	//context.stroke();
}

function drawHalfBox(context, currentColor, supplementaryColor, x, y, token, ratio, viewOffset) {
	if (token.slant == '/') {
		context.beginPath();
		context.fillStyle = currentColor;
		context.strokeStyle = 'transparent'; //currentColor;
		context.moveTo(viewOffset.x + x * ratio, viewOffset.y + y * ratio);
		context.lineTo(viewOffset.x + x * ratio + ratio, viewOffset.y + y * ratio);
		context.lineTo(viewOffset.x + x * ratio , viewOffset.y + y * ratio + ratio);
		context.closePath();
		context.fill();

		context.beginPath();
		context.fillStyle = supplementaryColor;
		context.strokeStyle = 'transparent'; //currentColor;
		context.moveTo(viewOffset.x + x * ratio  + ratio, viewOffset.y + y * ratio);
		context.lineTo(viewOffset.x + x * ratio + ratio, viewOffset.y + y * ratio + ratio);
		context.lineTo(viewOffset.x + x * ratio, viewOffset.y + y * ratio  + ratio);
		context.closePath();
		context.fill();
	} else {
		context.beginPath();
		context.fillStyle = currentColor;
		context.strokeStyle = 'transparent'; //currentColor;
		context.moveTo(viewOffset.x + x * ratio, viewOffset.y + y * ratio);
		context.lineTo(viewOffset.x + x * ratio , viewOffset.y + y * ratio + ratio);
		context.lineTo(viewOffset.x + x * ratio+ ratio, viewOffset.y + y * ratio  + ratio);
		context.closePath();
		context.fill();

		context.beginPath();
		context.fillStyle = supplementaryColor;
		context.strokeStyle = 'transparent'; //currentColor;
		context.moveTo(viewOffset.x + x * ratio, viewOffset.y + y * ratio);
		context.lineTo(viewOffset.x + x * ratio + ratio, viewOffset.y + y * ratio);
		context.lineTo(viewOffset.x + x * ratio + ratio, viewOffset.y + y * ratio  + ratio);
		context.closePath();
		context.fill();

	}
}

function getMousePos(canvas, model, evt) {
	var ratio = model.ratio, offset = model.viewOffset;

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

