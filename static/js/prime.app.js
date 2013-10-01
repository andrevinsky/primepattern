/**
 * Created with JetBrains PhpStorm.
 * User: ANDREW
 * Date: 10/1/13
 * Time: 2:11 PM
 * To change this template use File | Settings | File Templates.
 */

window.onload = function () {
	initCanvas(document.getElementById('myCanvas'));
};

function initCanvas(canvas) {
	canvas.width = 1400; // Ширина холста
	canvas.height = 1000; // высота холста
	canvas.addEventListener('mousemove', function (evt) {
		var mousePos = getMousePos(canvas, evt);
		drawPatterns(canvas, mousePos.x, mousePos.y);
	}, false);

}

function prepareBoard(canvas) {
	var context = canvas.getContext('2d');
	context.font = "10pt sans-serif";
	context.beginPath();
	//context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "rgb(256,256,256)";
	context.fillRect(0, 0, canvas.width, canvas.height);
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

function drawLine(context, style, fromX, fromY, newX, newY) {
	var xStart = 10;
	var yStart = 10;
	var SizeKofX = 5;
	var SizeKofY = 5;

	context.beginPath();
	context.strokeStyle = style;
	context.moveTo(xStart + fromX * SizeKofX, yStart + fromY * SizeKofY);
	context.lineTo(xStart + newX * SizeKofX, yStart + newY* SizeKofY);
	context.stroke();
}

function drawPatterns(canvas, xView, yView) {
	var context = prepareBoard(canvas);
	var SizeKofX = 5;
	var SizeKofY = 5;
	var xStart = 10;
	var yStart = 10;


	var xMax = Math.round((xView - xStart) / SizeKofX);
	var yMax = Math.round((yView - yStart) / SizeKofY);


	var x = 0, y = 0, xNew, yNew, color, xOrd, yOrd, xPar, yPar;
	for (var iter = 0, max = lcm(xMax, yMax); iter < max; iter++) {
		color = ((iter % 2) == 0) ? '#ff8765' : '#6512ff';
		x = iter % xMax;
		y = iter % yMax;

		xOrd = Math.floor(iter / yMax);
		yOrd = Math.floor(iter / xMax);

		xPar = (xOrd % 2) == 0;
		yPar = (yOrd % 2) == 0;

		x = xPar ? x : xMax - x;
		y = yPar ? y : yMax - y;

		xNew = x + (xPar ? 1 : -1);
		yNew = y + (yPar ? 1 : -1);

		drawLine(context, color, x, y, xNew, yNew);
	}


	var xStart = 10;
	var yStart = 10;
	var xEnd = SizeKofX * Math.round(xView / SizeKofX);
	var yEnd = SizeKofY * Math.round(yView / SizeKofY);


	context.beginPath();
	//context.strokeText("("+((xEnd-xStart)/Math.abs(SizeKofX))+", "+((yEnd-yStart)/Math.abs(SizeKofY))+"), "+i, xEnd+20,yEnd+20);
	context.strokeText("(" + (xMax) + ", " + (yMax) + "), " + max + ", " + (xMax/yMax), xEnd + 20, yEnd + 20);

	context.moveTo(xStart, yStart);
	context.lineTo(xStart, yEnd);
	context.lineTo(xEnd, yEnd);
	context.lineTo(xEnd, yStart);
	context.lineTo(xStart, yStart);

	context.stroke();
}

function getMousePos(canvas, evt) {
	var obj = canvas;
	var top = 0;
	var left = 0;
	while (obj && obj.tagName != 'BODY') {
		top += obj.offsetTop;
		left += obj.offsetLeft;
		obj = obj.offsetParent;
	}

	var mouseX = evt.clientX - left + window.pageXOffset;
	var mouseY = evt.clientY - top + window.pageYOffset;
	return {
		x: mouseX,
		y: mouseY
	};
}

