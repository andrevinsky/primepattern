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
		canvasUI: $('#interaction_layer'),
		canvasEcho: $('.canvas-echo'),
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
		increase: $('#increase_sides'),
		pixelate: $('#pixelate'),
		doArrows: $('#show_directions')
	}, {
		canvas: { width: 1400, height: 1000 },
		colors: 2,
		patternSize: { width: 15, height: 8},
		ratio: 10,
		fill: false,
		outline: false,
		alternate: false,
		pixelate: false,
		doArrows: true,
		doArrowsLast: true,
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

function checkRules(model) {
	if (model.ratio < 7) {
		model.doArrows = false;
	} else {
		model.doArrows = model.doArrowsLast;
	}
}

function initCanvas(view, model) {

	view.canvasUI.on('click', function (evt) {
		var mousePos = getMousePos(view.canvasUI[0], model, evt);

		model.patternSize.width = mousePos.x;
		model.patternSize.height = mousePos.y;

		view.inputW.val(model.patternSize.width);
		view.inputH.val(model.patternSize.height);

		drawPatterns(view, model);
	});

	view.colorSelector.val(model.colors).on('change', function(){
		model.colors = $(this).val() >>> 0;
		drawPatterns(view, model);
	});

	view.ratioCtl.val(model.ratio).on('change', function(){
		model.ratio = parseFloat($(this).val());
		checkRules(model);
		drawPatterns(view, model);
	});

	view.alternateColors.prop('checked', model.alternate).on('change', function(){
		model.alternate = $(this).is(':checked');
		drawPatterns(view, model);
	});

	view.pixelate.prop('checked', model.pixelate).on('change', function(){
		model.pixelate = $(this).is(':checked');
		drawPatterns(view, model);
	});

	view.doArrows.prop('checked', model.doArrows).on('change', function(){
		model.doArrowsLast = model.doArrows = $(this).is(':checked');
		checkRules(model);
		drawPatterns(view, model);
	});

	view.fill.prop('checked', model.fill).on('change', function(){
		model.fill = $(this).is(':checked');
		drawPatterns(view, model);
	});

	view.outline.prop('checked', model.outline).on('change', function(){
		model.outline = $(this).is(':checked');
		drawPatterns(view, model);
	});


	view.inputW.val(model.patternSize.width);
	view.inputH.val(model.patternSize.height);
	view.dimensions.on('submit', function(evt){
		evt.preventDefault();
		model.patternSize.width = view.inputW.val() >>> 0;
		model.patternSize.height = view.inputH.val() >>> 0;
		drawPatterns(view, model);
		return false;
	});

	view.swapper.on('click', function(){
		var tmp = model.patternSize.width;
		model.patternSize.width = model.patternSize.height;
		model.patternSize.height = tmp;

		view.inputW.val(model.patternSize.width);
		view.inputH.val(model.patternSize.height);

		drawPatterns(view, model);
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

		drawPatterns(view, model);
	});
	view.increase.on('click', function(){
		var min = Math.min(model.patternSize.width, model.patternSize.height),
				max = Math.max(model.patternSize.width, model.patternSize.height);

		model.patternSize.width = max + min;
		model.patternSize.height = max;

		view.inputW.val(model.patternSize.width);
		view.inputH.val(model.patternSize.height);

		drawPatterns(view, model);
	});

	drawPatterns(view, model);
}

function prepareBoard(canvas, model) {

	var  viewOffset = model.viewOffset, ratio = model.ratio, coords = {
		x: model.patternSize.width,
		y: model.patternSize.height
	};

	canvas.width = viewOffset.x * 3 + coords.x * ratio;
	canvas.height = viewOffset.y * 4 + coords.y * ratio;

	var context = canvas.getContext('2d');

	context.font = "10pt sans-serif";
	context.beginPath();
	//context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "rgba(255,255,255, 0)";
	context.fillRect(0, 0, canvas.width, canvas.height);

	var xStart = viewOffset.x,
			yStart = viewOffset.y;

	var xEnd = viewOffset.x + coords.x * ratio,
			yEnd = viewOffset.y + coords.y * ratio;

	var _gcd = gcd(coords.x, coords.y),_lcm = coords.x * coords.y / _gcd;

	var info = "(" + (coords.x) + ", " + (coords.y) + ") = " + _gcd + ", LCM: " + _lcm;
	if (ratio * model.patternSize.width > 300) {
		var max, min, seq = [
			max = Math.max(model.patternSize.width, model.patternSize.height),
			min = Math.min(model.patternSize.width, model.patternSize.height)
		], diff = max - min;

		while(diff > 1) {
			seq.push(diff);
			max = Math.max(min, diff);
			min = Math.min(min, diff);
			diff = max - min;
		}
		info += ', Seq: [' + seq.join(', ') + ']';
	}

	context.beginPath();
	context.strokeStyle = '#444';
	context.textAlign="right";
	context.strokeText(info, xEnd + 20, yEnd + 20);

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

function prepareModel(thread, xMax, yMax) {
	var def = new $.Deferred(), state = {
		result: [],
		current: 0,
		max: lcm(xMax, yMax),
		doIncrement: function(){
			this.current++;
		},
		getCondition: function(){
			return this.current < this.max;
		},
		getResult: function(){
			return this.result;
		},
		run: function(){
			var i = this.current;
			var moduloCoords, wholePartCoords, isEvenPair, reflectedCoords, directionPair;
			var result = this.result;
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
	};
	performAsync(thread, def, state);

	return def.promise();
}

function performAsync(thread, def, state){
	var iters = 1000, stopwatch = new Date() - 0;
	if (thread.state() == 'rejected')
		return;
	while(iters--) {
		var cond = state.getCondition();
		if (cond) {
			state.run();
			state.doIncrement();
		} else {
			def.resolve(state.getResult());
			return;
		}
	}

	console.log(stopwatch + ', took ' + (new Date() - stopwatch) + 'ms');
	window.setTimeout(function(){ performAsync(thread, def, state); }, 52);
}

function drawPatterns(view, model) {

	view.canvas.show();
	view.canvasEcho.hide();

	var canvas = view.canvas[0],
			context = prepareBoard(canvas, model),
			coords = model.patternSize,
			colorsCount = model.colors,
			ratio = model.ratio,
			viewOffset = model.viewOffset,
			alternate = model.alternate,
			doFill = model.fill,
			outlineOnly = model.outline,
			colors = model.colorBank;

	var thread = model.thread;
	if (thread) {
		thread.reject();
	}

	var xMax = coords.width, yMax = coords.height;

	model.thread = $.Deferred(function(def){
		prepareModel(def, xMax, yMax).done(function(patternModel){
			if (doFill) {
				fillAsync(def, {
					initialY: 0,
					initialX: 0,
					currentY: 0,
					currentX: 0,
					maxY: yMax,
					maxX: xMax,
					currentRowColor: 0,
					currentColor: 0,
					colorBank: [colors[0], colors[1]],
					result: {},
					model: patternModel,
					mode: outlineOnly ? 'outline' : 'full',
					doIncrement: function(){
						this.currentX++;
						if (this.currentX < this.maxX)
							return;

						this.currentX = this.initialX;
						this.currentY++;

						this.currentColor = this.currentRowColor;

					},
					getCondition: function(){
						return this.currentY < this.maxY;
					},
					getResult: function(){
						return this.result;
					},
					run: function(){
						var x = this.currentX, y = this.currentY;
						var key = x + this.maxX * y, token = this.model[key];
						switch(this.mode) {
							case 'outline':
								if (!token) {
									drawSolidBox(context, this.colorBank[this.currentColor], x, y, ratio, viewOffset);
								}
								break;
							case 'full':
								if (token && (alternate ? ((token.idx % 2) == 0) : ((token.idx % 2) == 1))) {
									if ((x == 0) && (token.slant == '\\')) {
										this.currentRowColor = this.currentColor = 1 - this.currentRowColor;
									}
									drawHalfBox(context, this.colorBank[this.currentColor], this.colorBank[1 - this.currentColor], x, y, token, ratio, viewOffset);
									this.currentColor = 1 - this.currentColor;
									if ((x == 0) && (token.slant == '/')) {
										this.currentRowColor = 1 - this.currentRowColor;
									}
								} else {
									drawSolidBox(context, this.colorBank[this.currentColor], x, y, ratio, viewOffset);
								}

								break;
						}
					}
				}).done(function(){
					def.resolve();
				});

			} else {
				var item, color, colorKey, pixelate = model.pixelate, doArrows = model.doArrows;
				for (var i = 0, max = patternModel.length; i < max; i++) {
					item = patternModel[i];
					if (!item) continue;
					var x = i % xMax, y = Math.floor(i / xMax);
					colorKey = (item.idx % (colorsCount || 2));
					color = ((alternate)
							? colors[Math.floor(colorKey / 2) * 2 + (1 - (colorKey % 2))]
							: colors[colorKey]);
					if (pixelate){
						drawSolidBox(context, color, x, y, ratio, viewOffset);
					} else
						drawLineNew(context, color, x, y, item.direction, ratio, viewOffset, doArrows);
				}
				def.resolve();
			}

		});
	});
	model.thread.done(function(){
		var uri = canvas.toDataURL('image/png');
		view.canvasEcho.first().prop('src', uri).show().width(view.canvas.width()).height(view.canvas.height()).show();
		view.canvas.hide();

	}).always(function(){
		delete model.thread;
	});

}

function fillAsync(thread, initialState){
	var def = new $.Deferred();
	performAsync(thread, def, initialState);
	return def.promise();
}

function drawLineNew(context, style, fromX, fromY, direction, ratio, viewOffset, doArrows) {
	context.beginPath();
	context.strokeStyle = style;
	var diffX = direction % 2, diffY = Math.floor(direction / 2);
	var x = viewOffset.x + (fromX + diffX) * ratio,
			y = viewOffset.y + (fromY + diffY) * ratio;

	if (doArrows) {
		context.moveTo(x, y + 1.5);
		context.lineTo(
				viewOffset.x + (fromX + diffX + ((diffX === 0 ) ? 1 : -1)) * ratio,
				viewOffset.y + (fromY + diffY + ((diffY === 0 ) ? 1 : -1)) * ratio);

		context.lineTo(x, y - 1.5);
	} else {
		context.moveTo(x, y);
		context.lineTo(
				viewOffset.x + (fromX + diffX + ((diffX === 0 ) ? 1 : -1)) * ratio,
				viewOffset.y + (fromY + diffY + ((diffY === 0 ) ? 1 : -1)) * ratio);

		context.lineTo(x, y);
	}
	context.stroke();
}

function drawSolidBox(context, style, x, y, ratio, viewOffset) {
	context.beginPath();
	context.fillStyle = style;
	context.fillRect(viewOffset.x + x * ratio, viewOffset.y + y * ratio, ratio, ratio);
	context.stroke();
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

