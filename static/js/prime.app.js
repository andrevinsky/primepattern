/**
 * Created with JetBrains PhpStorm.
 * User: ANDREW
 * Date: 10/1/13
 * Time: 2:11 PM
 * To change this template use File | Settings | File Templates.
 */

(function($){
	'use strict';

	$(function () {
		initCanvas({
			canvas: $('#myCanvas'),
			canvasUI: $('#interaction_layer'),
			canvasEcho: $('.canvas-echo'),
			colorSelector: $('#color_banks'),
			inputW: $('#canvas_width'),
			inputH: $('#canvas_height'),
			dimensions: $('#draw_form'),
			ratioCtl: $('#ratio'),
			provideInfo: $('#provide_info'),
			provideAnalytics: $('#provide_analytics'),
			toggleOy: $('#toggle_y'),
			fill: $('[name="draw-mode"]'),
			outline: $('#outline_fill'),
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
			doArrows: $('#show_directions'),
			saveAs: $('#save_as')
		}, {
			canvas: { width: 1400, height: 1000 },
			patternSize: { width: 4, height: 3},
			ratio: 10,
			provideInfo: true,
			provideAnalytics: false,
			toggleOy: false,
			fill: false,
			outline: false,
			pixelate: false,
			doArrows: true,
			doArrowsLast: true,
			skipMainDiag: false,
			skipSecDiag: false,
			viewOffset: {
				x: 10,
				y: 10
			},
			lineColorBank: 2,
			lineColorBanks: [
					['#123eab'],
					['#123eab', 'rgba(0,0,0,0)'],
					['rgba(0,0,0,0)', '#123eab'],
					['#123eab', '#ffcccc'],
					['#ffcccc', '#123eab'],
					['#123eab', '#ffcccc', 'rgba(0,0,0,0)'],
					['#ffcccc', '#123eab', 'rgba(0,0,0,0)'],
					['#ffcccc', '#123eab', '#ffab00', '#00cc00', '#6f0aaa',
						'#ff4040', '#466fd5', '#ffc040', '#39e639', '#9d3ed5']
			],
			fillColorBank: 0,
			fillColorBanks: [
					['#ffcccc', '#123eab'],
					['#123eab', '#ffcccc']
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
		adjustColorBanks(view, model);
		fillCbDependencies(view, model);
	}

	function adjustColorBanks(view, model){
		var doFill = model.fill;
		var colorSwitch = view.colorSelector;
		if (((colorSwitch.data('fill') == 'fill') && doFill) || ((colorSwitch.data('fill') == 'lines') && !doFill))
			return;
		var value, source;
		if (doFill) {
			colorSwitch.data('fill', 'fill');
			value = model.fillColorBank;
			source = model.fillColorBanks;
		} else {
			colorSwitch.data('fill', 'lines');
			value = model.lineColorBank;
			source = model.lineColorBanks;
		}

		var markup = _.map(source, function(v, k){
			return [
				'<option value="', k, '">', k, ': ', v.join('|').substr(0,20), '</option>'
			].join('');
		}).join('');

		colorSwitch.html(markup).val(value);
	}

	function fillCbDependencies(view, model) {
		if (model.fill && (gcd(model.patternSize.width, model.patternSize.height) > 1)) {
			view.outline.removeProp('disabled');
		} else {
			view.outline.prop('disabled','disabled');
		}
	}

	function initCanvas(view, model) {

		model = _.extend(model, fromHash());

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
			if (model.fill) {
				model.fillColorBank = $(this).val() >>> 0;
			} else {
				model.lineColorBank = $(this).val() >>> 0;
			}
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

		view.provideAnalytics.prop('checked', model.provideAnalytics).on('change', function(){
			model.provideAnalytics = $(this).is(':checked');
			drawPatterns(view, model);
		});

		view.doArrows.prop('checked', model.doArrows).on('change', function(){
			model.doArrowsLast = model.doArrows = $(this).is(':checked');
			runDependencies(view, model);
			drawPatterns(view, model);
		});

		view.fill.removeAttr('checked').filter('[value="' + (model.fill ? 'fill' : 'lines') + '"]').attr('checked', true);
		view.fill.on('change', function(evt){
			model.fill = {
				'fill': true,
				'lines': false
			}[$(this).val()] || false;

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
		context.fillStyle = "rgba(255,255,255, 1)";
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
		var timeSlot = 100, stopwatch = new Date() - 0, cond;
		if (thread.state() == 'rejected')
			return;

		while((new Date() - stopwatch) < timeSlot) {
			cond = state.getCondition();
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
				//context = prepareBoard(canvas, model),
				coords = model.patternSize,
				ratio = model.ratio,
				viewOffset = model.viewOffset,
				doFill = model.fill,
				outlineOnly = model.outline,
				colors = doFill
						? model.fillColorBanks[model.fillColorBank]
						: model.lineColorBanks[model.lineColorBank],
				colorsCount = colors.length,
				toggleOy = model.toggleOy;

		var thread = model.thread;
		if (thread) {
			thread.reject();
		}

		var xMax = coords.width,
				yMax = coords.height;

		viewOffset.yBase = model.toggleOy ? yMax : 0;

		model.thread = $.Deferred(function(def){
			prepareModel(def, xMax, yMax).done(function(patternModel){

				var drawing = getDrawing(canvas, {
					toggleOy: toggleOy,
					ratio: ratio,
					viewOffset: viewOffset,
					coords: {
						x: coords.width,
						y: coords.height
					}
				}).init().coords();

				if (model.provideInfo) {
					drawing.info();
				}


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
						colorBank: colors,
						result: {},
						model: patternModel,
						mode: outlineOnly ? 'outline' : 'full',
						drawing: drawing,
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
							var x, y, point = { x: (x = this.currentX), y: (y = this.currentY) },
									key = x + this.maxX * y, item = this.model[key],
									direction;

							switch(this.mode) {
								case 'outline':
									if (!item) {
										this.drawing.box({
											color: this.colorBank[this.currentColor],
											from: point
										});
									}
									break;
								case 'full':
									if (item && ((item.idx % 2) == 1)) {
										direction = item.direction;
										if ((x == 0) && ((direction === 0)||(direction == 2))) {
											this.currentRowColor = this.currentColor = 1 - this.currentRowColor;
										}

										this.drawing.halfBox({
											color: this.colorBank[this.currentColor],
											colorTo: this.colorBank[1 - this.currentColor],
											from: point,
											direction: direction
										});

										this.currentColor = 1 - this.currentColor;

										if ((x == 0) && ((direction == 1)||(direction == 3))) {
											this.currentRowColor = 1 - this.currentRowColor;
										}
									} else {
										this.drawing.box({
											color: this.colorBank[this.currentColor],
											from: point
										});
									}

									break;
							}
						}
					}).done(function(){
						if (model.provideAnalytics) {
							drawing.analytics();
						}
						def.resolve();
					});

				} else {

					var pixelate = model.pixelate,
							doArrows = model.doArrows,
							skipMainDiag = model.skipMainDiag,
							skipSecDiag = model.skipSecDiag;

					var item, color, idx, direction;

					for (var i = 0, max = patternModel.length; i < max; i++) {
						item = patternModel[i];
						if (!item) continue;

						idx = item.idx;
						direction = item.direction;

						color = colors[idx % colorsCount];

						if (skipMainDiag && ((direction === 0)||(direction == 2))) continue;
						if (skipSecDiag && ((direction == 1)||(direction == 3))) continue;

						if (pixelate){
							drawing.box({
								color: color,
								from: item.point
							});
						} else {
							drawing.line({
								from: item.point,
								direction: direction,
								makeArrow: doArrows,
								color: color
							});
						}
					}
					if (model.provideAnalytics) {
						drawing.analytics();
					}
					def.resolve();
				}

			});
		});

		model.thread.done(function(){
			var uri = canvas.toDataURL('image/png');
			var filename = toFileName(model);
			toHash(model);
			view.canvasEcho.first().prop('src', uri).attr('download', filename).show().width(view.canvas.width()).height(view.canvas.height()).show();
			view.saveAs.attr('href', uri).attr('download', filename);
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

	function wrapAfter(func1, func2, context) {
		return function(){
			return func2.call(context || this, func1.apply(context || this, arguments));
		};
	}

	function getDrawing(canvas, model) {

		var  viewOffset = model.viewOffset,
				ratio = model.ratio,
				coords = model.coords;

		canvas.width = viewOffset.x * 2 + (coords.x + 1) * ratio;
		canvas.height = viewOffset.y * 3 + (coords.y + 1) * ratio;

		var context = canvas.getContext('2d');

		context.font = "10pt sans-serif";

		return {
			init: function() {
				this.begin()
						.setFillStyle('rgba(255,255,255, 1)');
				//context.clearRect(0, 0, canvas.width, canvas.height);
				context.fillRect(0, 0, canvas.width, canvas.height);
				return this;
			},
			coords: function() {
				var point = [0,0], v1 = [coords.x, 0], v2 = [0, coords.y], v3 = [-coords.x, 0], v4 = [0, -coords.y];
				this.begin()
						.setStrokeStyle('#444')
						.makePoly(this.toWorld(point),
								this.toWorldDiff(v1),
								this.toWorldDiff(v2),
								this.toWorldDiff(v3),
								this.toWorldDiff(v4)).stroke();


				var pointX = [coords.x, 0], v = [1, 0], endPin = add(pointX, v),
						_v1 = rot(0, -.5, 2/12),
						_v2 = rot(0, -.5, -(2/12));
				this.begin()
						.makeLine(this.toWorld(pointX), this.toWorldDiff(v))
						.makeLine(this.toWorld(endPin), this.toWorldDiff(_v1))
						.makeLine(this.toWorld(endPin), this.toWorldDiff(_v2))
						.makeLine(this.toWorld(add(endPin, _v1)), this.toWorldDiff(add(_v2, neg(_v1))))
						.stroke();

				var pointY = [0, coords.y], v = [0, 1];
				endPin = add(pointY, v);
				_v1 = rot(1, -.5, 2/12);
				_v2 = rot(1, -.5, -(2/12));
				this.begin()
						.makeLine(this.toWorld(pointY), this.toWorldDiff(v))
						.makeLine(this.toWorld(endPin), this.toWorldDiff(_v1))
						.makeLine(this.toWorld(endPin), this.toWorldDiff(_v2))
						.makeLine(this.toWorld(add(endPin, _v1)), this.toWorldDiff(add(_v2, neg(_v1))))
						.stroke();

				return this;
			},
			info: function() {
				var _gcd = gcd(coords.x, coords.y), _lcm = coords.x * coords.y / _gcd;
				var info = "(" + (coords.x) + ", " + (coords.y) + ") = " + _gcd + ", LCM: " + _lcm;
				var xEnd = viewOffset.x + coords.x * ratio,
						yEnd = viewOffset.y + coords.y * ratio;
				if (ratio * coords.x > 300) {
					var max, min, seq = [
						max = Math.max(coords.x, coords.y),
						min = Math.min(coords.x, coords.y)
					], diff = max % min;

					while (diff > 1) {
						seq.push(diff);
						max = Math.max(min, diff);
						min = Math.min(min, diff);
						diff = max % min;
					}
					info += ', Seq: [' + seq.join(', ') + ']';
				}

				this.begin().setStrokeStyle('#222');

				context.textAlign = "right";
				context.strokeText(info, xEnd, yEnd + 20);

				return this;
			},
			analytics: function() {
				var x = coords.x, y = coords.y, partial, mod, point, v1, v2, i;
				while (true) {
					point = [x, y];
					if ((x == y) || (x <= 1) || (y <= 1)) {
						break;
					} else if (x > y) {
						partial = Math.floor(x / y);
						mod = x % y;

						for (i = partial; i > 0; i--) {
							v1 = [-y, 0];
							v2 = [0, -y];
							point = add(point, v1);
							this.begin()
									.setStrokeStyle('#744')
									.makeLine(this.toWorld(point), this.toWorldDiff(v2))
									.stroke();
						}

						x = mod;
					} else {
						partial = Math.floor(y / x);
						mod = y % x;
						for (i = partial; i > 0; i--) {
							v1 = [0, -x];
							v2 = [-x, 0];
							point = add(point, v1);
							this.begin()
									.setStrokeStyle('#447')
									.makeLine(this.toWorld(point), this.toWorldDiff(v2))
									.stroke();
						}

						y = mod;
					}
				}

			},
			box: function(o) {
				var boxCoords = o.from,
						style = o.color;

				var basePoint = [boxCoords.x, boxCoords.y]; //add([boxCoords.x, boxCoords.y], [[0,0], [1, 0], [1, 1], [0, 1]][0]);

				this.begin()
						.setFillStyle(style)
						.makeBox(this.toWorld(basePoint), this.toWorldDiff([1, 1]))
						.stroke();

				return this;
			},
			halfBox: function(o){
				var boxCoords = o.from,
						direction = o.direction,
						style = o.color,
						style2 = o.colorTo;

				var isMainDiag = ((direction == 0)||(direction == 2)),
						basePoint = isMainDiag ? [boxCoords.x, boxCoords.y] : add([boxCoords.x, boxCoords.y], [1, 0]),
						v1, v2, v3;

				if (isMainDiag) {
					v1 = [1, 1]; v2 = [0,-1]; v3 = [-1,0];
				} else {
					v1 = [-1, 1]; v3 = [0, -1]; v2 = [1, 0];
				}

				this.begin().setFillStyle(style).setStrokeStyle('transparent')
						.makePoly(this.toWorld(basePoint), this.toWorldDiff(v1), this.toWorldDiff(v3))
						.close().fill();

				this.begin().setFillStyle(style2).setStrokeStyle('transparent')
						.makePoly(this.toWorld(basePoint), this.toWorldDiff(v1), this.toWorldDiff(v2))
						.close().fill();
			},
			line: function(o){
				var boxCoords = o.from,
						direction = o.direction,
						makeArrow = o.makeArrow,
						style = o.color;

				var vector = rot(direction, 1, 1),
						basePoint = add([boxCoords.x, boxCoords.y], [[0,0], [1, 0], [1, 1], [0, 1]][direction]);

				this.begin().setStrokeStyle(style);

				if (!makeArrow) {
					this.makeLine(this.toWorld(basePoint), this.toWorldDiff(vector));
				} else {
					var endPin = add(basePoint, vector),
							v1 = rot(direction, -(7/12),-(5/12)),
							v2 = rot(direction, -(5/12),-(7/12));
					this.makeLine(this.toWorld(basePoint), this.toWorldDiff(vector))
							.makeLine(this.toWorld(endPin), this.toWorldDiff(v1))
							.makeLine(this.toWorld(endPin), this.toWorldDiff(v2))
							.makeLine(this.toWorld(add(endPin, v1)), this.toWorldDiff(add(v2, neg(v1))));
				}
				this.stroke();
			},
			begin: wrapAfter(function(){ context.beginPath(); }, returnThis),
			stroke: wrapAfter(function(){ context.stroke(); }, returnThis),
			fill: wrapAfter(function(){ context.fill(); }, returnThis),
			close: wrapAfter(function(){ context.closePath(); }, returnThis),
			setStrokeStyle: wrapAfter(function(style) { context.strokeStyle = style; }, returnThis),
			setFillStyle: wrapAfter(function(style) { context.fillStyle = style;; }, returnThis),
			makeLine: wrapAfter(bindArgs(context, makeVect), returnThis),
			makeBox: wrapAfter(bindArgs(context, makeRect), returnThis),
			makePoly: wrapAfter(bindArgs(context, makePolygon), returnThis),
			rotate: feedArray(null, rot),
			toWorld: model.toggleOy
					? feedArray(null, curry(null, transpose, model.ratio, -model.ratio, model.viewOffset.x, model.viewOffset.y + (model.ratio * (model.viewOffset.yBase + 1))))
					: feedArray(null, curry(null, transpose, model.ratio, model.ratio, model.viewOffset.x, model.viewOffset.y)),
			toWorldDiff: model.toggleOy
					? feedArray(null, curry(null, transpose, model.ratio, -model.ratio, 0, 0))
					: feedArray(null, curry(null, transpose, model.ratio, model.ratio, 0, 0))
		};

		function returnThis() { return this; }
		function makeRect(from, vect) {
			var fromX = from[0], fromY = from[1], vX = vect[0], vY = vect[1];
			this.fillRect(fromX, fromY, vX, vY);
		}
		function makeVect(from, vect) {
			var fromX = from[0], fromY = from[1], vX = fromX + vect[0], vY = fromY + vect[1];
			this.moveTo(fromX +.5, fromY +.5);
			this.lineTo(vX +.5, vY +.5);
		}
		function makePolygon(from) {
			var args = Array.prototype.slice.call(arguments, 1);
			var fromX = from[0], fromY = from[1], vX = fromX, vY= fromY, vect;
			this.moveTo(fromX, fromY);
			for (; vect = args.shift();) {
				vX += vect[0];
				vY += vect[1];
				this.lineTo(vX, vY);
			}
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

	}

	function toFileName(m) {
		return ['IMG_w', m.patternSize.width, '_h', m.patternSize.height, '_', (new Date() - 0), '.png'].join('');
	}
	function toHash(m) {
		var str = _.map({
			'w': m.patternSize.width,
			'h': m.patternSize.height,
			'f': m.fill,
			'c': m.fill ? m.fillColorBank : m.lineColorBank,
			'o': m.fill ? m.outline : null,
			'p': !m.fill ? m.pixelate : null,
			'd': !m.fill ? m.doArrows : null,
			'sdm': !m.fill ? m.skipMainDiag : null,
			'sds': !m.fill ? m.skipSecDiag : null,
			'r': m.ratio,
			'i': m.provideInfo,
			'a': m.provideAnalytics,
			'y': m.toggleOy
		}, function(v, k) {
			if (v === null) return '';
			return [k, v].join('=');}).join('&');
		location.hash = '!' + str.replace(/&&+/, '&');
	}
	function fromHash() {
		var str = location.hash;
		if (!/^#!/.test(str))
			return {};
		var map = {
			'w' : 'patternSize.width',
			'h' : 'patternSize.height',
			'f' : 'fill',
			'c' : '_colorBank',
			'sdm': '_skipMainDiag',
			'sds': '_skipSecDiag',
			'p' : '_pixelate',
			'd' : '_doArrows',
			'o' : '_outline',
			'r' : 'ratio',
			'i' : 'provideInfo',
			'a' : 'provideAnalytics',
			'y' : 'toggleOy'
		};
		var input = str.replace(/^#!/, '').split(/&/);
		var obj = _.reduce(input, function(memo, v) {
			var pair = v.split('=');
			if (pair.length == 2) {
				var value = ((/^\d+$/.test(pair[1])) ? pair[1] >>> 0 : pair[1]) ,trueKey = map[pair[0]];
				if (trueKey) {
					ensureObjValue(memo, trueKey.split(/\./), value);
				}
			}
			return memo;
		}, {});

		if ((typeof obj['fill'] != 'undefined')) {
			if ((typeof obj['_colorBank'] != 'undefined')) {
				if (obj.fill) {
					obj.fillColorBank = obj['_colorBank'];
				} else {
					obj.lineColorBank = obj['_colorBank'];
				}
				delete obj['_colorBank'];
			}

			if ((typeof obj['_outline'] != 'undefined')) {
				if (obj.fill) {
					obj.outline = obj['_outline'];
				}
				delete obj['_outline'];
			}

			if ((typeof obj['_skipMainDiag'] != 'undefined')) {
				if (!obj.fill) {
					obj.skipMainDiag = obj['_skipMainDiag'];
				}
				delete obj['_skipMainDiag'];
			}

			if ((typeof obj['_skipSecDiag'] != 'undefined')) {
				if (!obj.fill) {
					obj.skipSecDiag = obj['_skipSecDiag'];
				}
				delete obj['_skipSecDiag'];
			}

			if ((typeof obj['_pixelate'] != 'undefined')) {
				if (!obj.fill) {
					obj.pixelate = obj['_pixelate'];
				}
				delete obj['_pixelate'];
			}

			if ((typeof obj['_doArrows'] != 'undefined')) {
				if (!obj.fill) {
					obj.doArrows = obj['_doArrows'];
				}
				delete obj['_doArrows'];
			}

		}

		return obj;

		function ensureObjValue(obj, path, value) {
			if (!path || !path.length)
				return;
			var prop = path[0], hasMore = path.length > 1;
			if (hasMore) {
				if (!obj[prop]) {
					obj[prop] = {}
				}
				ensureObjValue(obj[prop], path.slice(1), value);
			} else {
				obj[prop] = parseValue(value);
			}
		}

		function parseValue(input){
			if (/^true$/.test(input)) return true;
			if (/^false$/.test(input)) return false;
			if (/^\d+$/.test(input)) return input >>> 0;
			return input;
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

})(jQuery);

