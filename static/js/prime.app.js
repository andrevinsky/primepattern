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
		provideInfo: $('#provide_info'),
		toggleOy: $('#toggle_y'),
		fill: $('#fill_colors'),
		outline: $('#outline_fill'),
		alternateColors: $('#alternate_colors'),
		swapper: $('#swap_sides'),
		reduce: $('#reduce_sides'),
		increase: $('#increase_sides'),
		resizeLeft: $('#resize_left'),
		resizeRight: $('#resize_right'),
		resizeUp: $('#resize_up'),
		resizeDown: $('#resize_down'),
		skipMainDiag: $('#no_main_diag'),
		skipSecDiag: $('#no_sec_diag'),
		pixelate: $('#pixelate'),
		doArrows: $('#show_directions')
	}, {
		canvas: { width: 1400, height: 1000 },
		colors: 2,
		patternSize: { width: 4, height: 3},
		ratio: 10,
		provideInfo: true,
		toggleOy: false,
		fill: false,
		outline: false,
		alternate: false,
		pixelate: false,
		doArrows: true,
		doArrowsLast: true,
		skipMainDiag: false,
		skipSecDiag: false,
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

function runDependencies(view, model) {
	checkRules(model);
	fillCbDependencies(view, model);
}

function fillCbDependencies(view, model) {
	if (model.fill && (gcd(model.patternSize.width, model.patternSize.height) > 1)) {
		view.outline.removeProp('disabled');
	} else {
		view.outline.prop('disabled','disabled');
	}
}

function initCanvas(view, model) {

	view.canvasUI.on('click', function (evt) {
		var mousePos = getMousePos(view.canvasUI[0], model, evt);

		model.patternSize.width = mousePos.x;
		model.patternSize.height = mousePos.y;

		view.inputW.val(model.patternSize.width);
		view.inputH.val(model.patternSize.height);

		runDependencies(view, model);
		drawPatterns(view, model);
	});

	view.colorSelector.val(model.colors).on('change', function(){
		model.colors = $(this).val() >>> 0;
		drawPatterns(view, model);
	});

	view.ratioCtl.val(model.ratio).on('change', function(){
		model.ratio = parseFloat($(this).val());
		runDependencies(view, model);
		drawPatterns(view, model);
	});

	view.skipMainDiag.prop('checked', model.skipMainDiag).on('change', function(){
		model.skipMainDiag = $(this).is(':checked');
		drawPatterns(view, model);
	});

	view.skipSecDiag.prop('checked', model.skipSecDiag).on('change', function(){
		model.skipSecDiag = $(this).is(':checked');
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

	view.toggleOy.prop('checked', model.toggleOy).on('change', function(){
		model.toggleOy = $(this).is(':checked');
		drawPatterns(view, model);
	});

	view.provideInfo.prop('checked', model.provideInfo).on('change', function(){
		model.provideInfo = $(this).is(':checked');
		drawPatterns(view, model);
	});

	view.doArrows.prop('checked', model.doArrows).on('change', function(){
		model.doArrowsLast = model.doArrows = $(this).is(':checked');
		runDependencies(view, model);
		drawPatterns(view, model);
	});

	view.fill.prop('checked', model.fill).on('change', function(){
		model.fill = $(this).is(':checked');

		runDependencies(view, model);
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
		runDependencies(view, model);
		drawPatterns(view, model);
		return false;
	});

	view.swapper.on('click', function(){
		var tmp = model.patternSize.width;
		model.patternSize.width = model.patternSize.height;
		model.patternSize.height = tmp;

		view.inputW.val(model.patternSize.width);
		view.inputH.val(model.patternSize.height);
		runDependencies(view, model);
		drawPatterns(view, model);
	});

	$(document).on('keydown', function(evt){
		if (!evt.shiftKey)
			return;
		if(evt.keyCode == 37) {
			// left
			view.resizeLeft.click();
		}
		if(evt.keyCode == 38) {
			// up
			view.resizeUp.click();
		}
		if(evt.keyCode == 39) {
			// right
			view.resizeRight.click();
		}
		if(evt.keyCode == 40) {
			// down
			view.resizeDown.click();
		}
		return false;
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
		runDependencies(view, model);
		drawPatterns(view, model);
	});
	view.increase.on('click', function(){
		var min = Math.min(model.patternSize.width, model.patternSize.height),
				max = Math.max(model.patternSize.width, model.patternSize.height);

		model.patternSize.width = max + min;
		model.patternSize.height = max;

		view.inputW.val(model.patternSize.width);
		view.inputH.val(model.patternSize.height);
		runDependencies(view, model);
		drawPatterns(view, model);
	});

	view.resizeLeft.on('click', function(){
		if (model.patternSize.width <= model.patternSize.height) {
			return;
		}
		model.patternSize.width -= model.patternSize.height;
		view.inputW.val(model.patternSize.width);
		view.inputH.val(model.patternSize.height);
		runDependencies(view, model);
		drawPatterns(view, model);
	});

	view.resizeRight.on('click', function(){

		model.patternSize.width += model.patternSize.height;

		view.inputW.val(model.patternSize.width);
		view.inputH.val(model.patternSize.height);
		runDependencies(view, model);
		drawPatterns(view, model);
	});

	view.resizeUp.on('click', function(){
		if (model.toggleOy)
			return view.resizeDown.click();
		if (model.patternSize.height <= model.patternSize.width) {
			return;
		}
		model.patternSize.height -= model.patternSize.width;
		view.inputW.val(model.patternSize.width);
		view.inputH.val(model.patternSize.height);
		runDependencies(view, model);
		drawPatterns(view, model);
	});

	view.resizeDown.on('click', function(){
		if (model.toggleOy)
			return view.resizeUp.click();

		model.patternSize.height += model.patternSize.width;

		view.inputW.val(model.patternSize.width);
		view.inputH.val(model.patternSize.height);
		runDependencies(view, model);
		drawPatterns(view, model);
	});


	runDependencies(view, model);
	drawPatterns(view, model);
}


function provideInfo(model, coords, ratio, context, xEnd, yEnd) {
	var _gcd = gcd(coords.x, coords.y), _lcm = coords.x * coords.y / _gcd;

	var info = "(" + (coords.x) + ", " + (coords.y) + ") = " + _gcd + ", LCM: " + _lcm;
	if (ratio * model.patternSize.width > 300) {
		var max, min, seq = [
			max = Math.max(model.patternSize.width, model.patternSize.height),
			min = Math.min(model.patternSize.width, model.patternSize.height)
		], diff = max - min;

		while (diff > 1) {
			seq.push(diff);
			max = Math.max(min, diff);
			min = Math.min(min, diff);
			diff = max - min;
		}
		info += ', Seq: [' + seq.join(', ') + ']';
	}

	context.beginPath();
	context.strokeStyle = '#444';
	context.textAlign = "right";
	context.strokeText(info, xEnd + 20, yEnd + 20);
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

	if (model.provideInfo) {
		provideInfo(model, coords, ratio, context, xEnd, yEnd);
	}

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

			var key = reflectedCoords.x + xMax * reflectedCoords.y;
			if (result[key]) {
				debugger;
			}
			var map = {
				0: 0, // x - even, y - even -> I (0)
				1: 1, // x - odd, y - even -> II (1)
				2: 3, // x - even, y - odd -> IV (3)
				3: 2  // x - odd, y - odd -> III (4)
			};
			result[key] = {
				point: reflectedCoords,
				direction: map[(isEvenPair.x ? 0 : 1) + (isEvenPair.y ? 0 : 2)],
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
									if ((x == 0) && ((token.direction === 0)||(token.direction == 2))) {
										this.currentRowColor = this.currentColor = 1 - this.currentRowColor;
									}
									drawHalfBox(context, this.colorBank[this.currentColor], this.colorBank[1 - this.currentColor], x, y, token, ratio, viewOffset);
									this.currentColor = 1 - this.currentColor;
									if ((x == 0) && ((token.direction == 1)||(token.direction == 3))) {
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

				viewOffset.yBase = model.toggleOy ? yMax : 0;
				for (var i = 0, max = patternModel.length; i < max; i++) {
					item = patternModel[i];
					if (!item)
						continue;

					var idx = item.idx;
					var x = item.point.x,
							y = item.point.y;

					colorKey = (idx  % (colorsCount || 2));
					color = ((alternate)
							? colors[Math.floor(colorKey / 2) * 2 + (1 - (colorKey % 2))]
							: colors[colorKey]);

					if (pixelate){
						drawSolidBox(context, color, x, y, ratio, viewOffset);
					} else
						drawLineNew(context, color, item.point, item.direction, ratio, viewOffset, doArrows, model.toggleOy, model.skipMainDiag, model.skipSecDiag);
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

function drawLineNew(context, style, boxCoords, direction, ratio, viewOffset, doArrows, toggleOy, skipMainDiag, skipSecDiag) {
	context.beginPath();
	context.strokeStyle = style;

	var makeLine = bindArgs(context, makeVect);

	var rotApos = feedArray(null, curry(null, rot, direction)),
			toWorld = feedArray(null, curry(null, transpose, ratio, ratio, viewOffset.x, viewOffset.y)),
			toWorldDiff = feedArray(null, curry(null, transpose, ratio, ratio, 0, 0));

	if (toggleOy) {
		toWorld = feedArray(null, curry(null, transpose, ratio, -ratio, viewOffset.x, viewOffset.y + (ratio * viewOffset.yBase)));
		toWorldDiff = feedArray(null, curry(null, transpose, ratio, -ratio, 0, 0));
	}

	var vector = rotApos([1, 1]);
	var basePoint = add([boxCoords.x, boxCoords.y], [[0,0], [1, 0], [1, 1], [0, 1]][direction]);

	if (skipSecDiag && ((direction == 1)||(direction == 3))) { return; }
	if (skipMainDiag && ((direction === 0)||(direction == 2))) { return; }

	if (!doArrows) {
		makeLine(toWorld(basePoint), toWorldDiff(vector));
	} else {
		makeLine(toWorld(basePoint), toWorldDiff(vector));
		var endPin = add(basePoint, vector),
				v1 = rot(direction, -(7/12),-(5/12)),
				v2 = rot(direction, -(5/12),-(7/12));
		makeLine(toWorld(endPin), toWorldDiff(v1));
		makeLine(toWorld(endPin), toWorldDiff(v2));
		makeLine(toWorld(add(endPin, v1)), toWorldDiff(add(v2, neg(v1))));
	}

	context.stroke();
}

function makeVect(from, vect) {
	var fromX = from[0], fromY = from[1], vX = vect[0], vY = vect[1];
	this.moveTo(fromX, fromY);
	this.lineTo(fromX + vX, fromY + vY);
}

function transpose(kX, kY, offsetX, offsetY, x, y) {
	return [offsetX + x * kX, offsetY + y * kY];
}

function add(v1, v2) {
	return [v1[0] + v2[0], v1[1] + v2[1]];
}
function neg(v1) {
	return [-v1[0], -v1[1]];
}

function rot(degShort, x, y) {
	var sD, cD;
	switch(degShort % 4) {
		case 0: // 45 deg;
			sD = 0; cD = 1;
			break;
		case 1: // 45 + 90 deg
			sD = 1; cD = 0;
			break
		case 2: // 45 + 180 deg
			sD = 0; cD = -1;
			break;
		case 3: // 45 + 270 deg
			sD = -1; cD = 0;
			break;
	}
	return [x * cD - y * sD, y * cD + x * sD];
}

function bindArgs(context, func, Tfunc) {
	var isTFuncPresent = arguments.length == 3;
	if (isTFuncPresent)
		return function(){
			return func.apply(context || this, Tfunc.apply(this, arguments));
		};
	else {
		return function(){
			return func.apply(context || this, arguments);
		};
	}
}

function curry(context, func, _args) {
	var args = Array.prototype.slice.call(arguments, 2);
	return function(){
		var args1 = args.concat(Array.prototype.slice.apply(arguments));
		return func.apply(context || this, args1);
	};
}

function feedArray(context, func) {
	return function(args) {
		return func.apply(context || this, args);
	};
}

function drawSolidBox(context, style, x, y, ratio, viewOffset) {
	context.beginPath();
	context.fillStyle = style;
	context.fillRect(viewOffset.x + x * ratio, viewOffset.y + y * ratio, ratio, ratio);
	context.stroke();
}

function drawHalfBox(context, currentColor, supplementaryColor, x, y, token, ratio, viewOffset) {
	if ((token.direction == 0)||(token.direction == 2)) {
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

