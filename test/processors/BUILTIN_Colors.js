var stringToColour = function (i) {
    var num = (i+1) * 500000;
    if ((i % 2) == 0) {
        num = num * 100;
    }
    num >>>= 0;
    var b = num & 0xFF,
        g = (num & 0xFF00) >>> 8 % 255,
        r = (num & 0xFF0000) >>> 16 % 255;
    return "rgb(" + [r, g, b].join(",") + ")";
}

var runColors = function (num) {
    for (var i = 1; i <= 10; i++) {
        console.log(stringToColour(color));
    }
};

runColors();