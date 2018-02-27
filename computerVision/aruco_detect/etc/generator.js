<!doctype html>
<html>

<head>
    <style> #cnvs_img { position: absolute; top : 30%; left: 50%; transform: translateX(-50%); } </style>
<script>
'use strict';


const angle = [0, 90, 180, 270];
const cm = 5; // aruco size

const ArucoMarker = {
    getMatrix: (id) => {
        const ids = [16, 23, 9, 14];

        let matrix = [
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0],
            [0,0,0,0,0]
        ];

        for (let y=0; y<5; y++) {
            let idx = (id >> 2 * (4 - y)) & 3;
            let val = ids[idx];
            for (let x=0; x<5; x++) {
                if ((val >> (4 - x)) & 1) {
                    matrix[x][y] = 1;
                }/*
                else {
                    matrix[x][y] = 0;
                }*/
            }
        }

        // angle 0, 90, 180, 270, -90, ...
        return rotateMatrix(matrix, 0);
    }
};

const Canvas = {
    cnvs: null,
    ctx: null,

    // 1비트당 픽셀 수
    // 1비트당 0.1875cm
    bitSize: cm / 0.1875,
    // 마커당 출력수
    markerPerLine: 5,
    // 상하좌우 간격
    margin:  10,

    // 배경색, 전경색
    bgColor: 'white',
    foreColor: 'black',

    init: () => {
        const self = Canvas;
        self.cnvs = document.getElementById('cnvs');
        self.ctx = self.cnvs.getContext('2d');
    },

    setMarker: (x, y, matrix) => {
        const self = Canvas;
        const ctx = self.ctx;

        const bitSize = self.bitSize;
        const markerSize = bitSize * 7;
        const posX = (x * markerSize) + (x * self.margin) + self.margin;
        const posY = (y * markerSize) + (y * self.margin) + self.margin;

        ctx.fillStyle = self.foreColor;
        ctx.fillRect(posX, posY, markerSize,markerSize);

        ctx.fillStyle = self.bgColor;
        for (let x=0; x<5; x++) {
            for (let y=0; y<5; y++) {
                if (matrix[x][y] == 0) continue;

                ctx.fillRect(posX+(bitSize*x)+bitSize, posY+(bitSize*y)+bitSize, bitSize, bitSize);
            }
        }
    },

    drawMarker: (idList) => {
        const self = Canvas;

        self.init();

        const w = (self.bitSize * 7 * self.markerPerLine) + ((self.markerPerLine * self.margin) - self.margin) + (self.margin * 2);
        const h = (self.bitSize * 7 * idList.length) + ((idList.length * self.margin) - self.margin) + (self.margin * 2);

        self.cnvs.setAttribute('width', w);
        self.cnvs.setAttribute('height', h);

        self.ctx.fillStyle = self.bgColor;
        self.ctx.fillRect(0,0, w,h);

        for (let y=0; y<idList.length; y++) {
            let matrix = ArucoMarker.getMatrix(idList[y]);
            for (let x=0; x<Canvas.markerPerLine; x++) {
                Canvas.setMarker(x,y, matrix);
            }
        }

        document.getElementById('cnvs_img').src = self.cnvs.toDataURL();
    }
};

Number.prototype.mod = function (n) {
    return ((this % n) + n) % n;
}

// direction : 0, 90, 180, 270
var rotateMatrix = function (matrix, direction) {
    direction = direction.mod(360) || 0;
    var ret = matrix;
    // Does not work with non-square matricies.
    var transpose1 = function (m) {
        for (var i = 0; i < m.length; i++) {
            for (var j = i; j < m[0].length; j++) {
                var x = m[i][j];
                m[i][j] = m[j][i];
                m[j][i] = x;
            }
        }
        return m;
    };

    // Efficiently builds and fills values at the same time.
    var transpose3 = function (m) {
        var result = new Array(m[0].length);
        for (var i = 0; i < m[0].length; i++) {
            result[i] = new Array(m.length - 1);
            for (var j = m.length - 1; j > -1; j--) {
                result[i][j] = m[j][i];
            }
        }
        return result;
    };

    var transpose = function (m) {
        if (m.length === m[0].length) {
            return transpose1(m);
        } else {
            return transpose3(m);
        }
    };

    var reverseRows = function (m) {
        return m.reverse();
    };

    var reverseCols = function (m) {
        for (var i = 0; i < m.length; i++) {
            m[i].reverse();
        }
        return m;
    };

    var rotate90Left = function (m) {
        m = transpose(m);
        m = reverseRows(m);
        return m;
    };

    var rotate90Right = function (m) {
        m = reverseRows(m);
        m = transpose(m);
        return m;
    };

    var rotate180 = function (m) {
        m = reverseCols(m);
        m = reverseRows(m);
        return m;
    };

    if (direction == 90 || direction == -270) {
        return rotate90Left(ret);
    } else if (direction == -90 || direction == 270) {
        return rotate90Right(ret);
    } else if (Math.abs(direction) == 180) {
        return rotate180(ret);
    }

    return matrix;
};

window.onload = () => {
    let idList = [72, 1022, 1021, 153, 500, 240, 121, 27, 2];
    Canvas.drawMarker(idList);
}
</script>
</head>

<body>

<canvas id="cnvs" style="display:none;"></canvas>
<img id="cnvs_img" style="border: 1px solid black;" />

</body>
</html>
