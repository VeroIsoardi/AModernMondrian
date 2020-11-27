function ClearRect() {}

ClearRect.prototype.step = function (width, height) {};
ClearRect.prototype.draw = function (context) {
    context.fillStyle = '#ffffff';
    context.strokeStyle = '#000000';
    context.lineWidth = 5;
    context.beginPath();
    context.rect(0, 0, context.canvas.width, context.canvas.height);
    context.fill();
    context.stroke();
    context.closePath();
};

function Rectangle(x, y, w, h, colour) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.c = colour;
}

Rectangle.prototype.step = function (width, height) {};
Rectangle.prototype.draw = function (context) {
    context.fillStyle = this.c;
    context.fillRect(this.x, this.y, this.w, this.h);
};

function Line(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
}

Line.prototype.step = function (width, height) {};
Line.prototype.draw = function (context) {
    context.lineWidth = 5;
    context.strokeStyle = '#000000';
    context.beginPath();
    context.moveTo(this.x1, this.y1);
    context.lineTo(this.x2, this.y2);
    context.stroke();
    context.closePath();
};

function Dot(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.w = 26;
    this.h = 26;

    this.prediction = {
        left: {
            x: 0,
            y: 0
        },
        right: {
            x: 0,
            y: 0
        },
        heading: -1
    }
}

Dot.prototype.step = function (width, height) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x <= 80) {
        this.x = 80;
        this.vx *= -1;
    }

    if (this.x >= 525 - this.w) {
        this.x = (525 - this.w);
        this.vx *= -1;
    }

    if (this.y <= 17) {
        this.y = 17;
        this.vy *= -1;
    }

    if (this.y >= 351 - this.h) {
        this.y = (351 - this.h);
        this.vy *= -1;
    }

    var x = this.x,
        y = this.y,
        vx = this.vx,
        vy = this.vy;

    // dirty prediction of the target area 
    if (this.vx < 0) {
        while (x > 80) {
            x += vx;
            y += vy;

            if (y <= 17) y = 17, vy *= -1;
            if (y >= 351 - this.h) y = 351 - this.h, vy *= -1;
        }

        this.prediction.heading = -1;
        this.prediction.left.x = x;
        this.prediction.left.y = y;
    } else {
        while (x < 525) {
            x += vx;
            y += vy;

            if (y <= 17) y = 17, vy *= -1;
            if (y >= 351 - this.h) y = 351 - this.h, vy *= -1;
        }

        this.prediction.heading = 1;
        this.prediction.right.x = x;
        this.prediction.right.y = y;
    }
};

Dot.prototype.draw = function (context) {
    context.fillStyle = '#000000';
    context.fillRect(this.x, this.y, this.w, this.h);
};

function SimulatedPlayer(side, dot) {
    this.side = side;
    this.dot = dot;

    if (this.side === -1) {
        this.prediction = 'left';
        this.x = 37.5;
        this.y = 177.5;
    } else {
        this.prediction = 'right';
        this.x = 525.5;
        this.y = 177.5;
    }
}

SimulatedPlayer.prototype.step = function (width, height) {
    // animate towards this.dot.prediction if the heading is this.side
    if (this.dot.prediction.heading === this.side) {
        var boundary = (this.side === -1 ? 80 : 525),
            maximum = 525 - 80,
            distance = (this.side === -1 ? this.dot.x - boundary : boundary - this.dot.x),
            factor = 1 - (distance / maximum);

        if (factor > .15) {
            var ty = (this.dot.prediction[this.prediction].y - 45 + (this.dot.h / 2));
            this.y = (this.y + (ty - this.y) * factor);
        }

        if (this.y <= 17) this.y = 17;
        if (this.y >= 351 - 90) this.y = 351 - 90;
    }
};

SimulatedPlayer.prototype.draw = function (context) {
    context.fillStyle = '#0000ff';
    context.lineWidth = 5;
    context.strokeStyle = '#000000';
    context.beginPath();
    context.rect(this.x, this.y, (this.side === -1 ? 42 : 40), 90);
    context.fill();
    context.stroke();
    context.closePath();
};

function StaticLayer(width, height) {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.renderables = [];
    this.canvas.width = width;
    this.canvas.height = height;
}

StaticLayer.prototype.push = function (renderable) {
    this.renderables.push(renderable);
};

StaticLayer.prototype.prepare = function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (var i in this.renderables) this.renderables[i].draw(this.context);
};

StaticLayer.prototype.step = function (width, height) {};
StaticLayer.prototype.draw = function (context) {
    context.drawImage(this.canvas, 0, 0);
};

window.addEventListener('load', function () {
    var canvas = document.getElementById('mondrian'),
        context = canvas.getContext('2d'),
        renderables = [],
        staticRenderables = new StaticLayer(canvas.width, canvas.height);

    staticRenderables.push(new ClearRect());

    // Squares
    staticRenderables.push(new Rectangle(2.0, 64, 37.5, 157, "#7CFC00")); // 1st one, green
    staticRenderables.push(new Rectangle(2.0, 221.5, 37.5, 130, "#ff0000")); // 2th one, red
    staticRenderables.push(new Rectangle(2.0, 351, 37.5, 22, "#0000ff")); // 3nd one, blue
    
    staticRenderables.push(new Rectangle(40, 2.0, 38, 15, "#7CFC00")); // 4th one, green

    staticRenderables.push(new Rectangle(80.5, 17.5, 125, 120, "#ff0000")); // 5th one, red
    staticRenderables.push(new Rectangle(80.5, 165, 125, 35, "#7CFC00")); // 6th one, green

    staticRenderables.push(new Rectangle(205.5, 2.0, 23, 16, "#ff0000")); // 7th one, red
    staticRenderables.push(new Rectangle(205.5, 135, 25, 30, "#0000ff")); // 8th one, blue
    staticRenderables.push(new Rectangle(205.5, 351, 23, 22, "#7CFC00")); // 9th one, green

    staticRenderables.push(new Rectangle(228.5, 170, 108, 180, "#0000ff")); // 10th one, blue
    staticRenderables.push(new Rectangle(228.5, 351, 155, 22, "#ff0000")); // 11th one, red

    staticRenderables.push(new Rectangle(333.5, 2.0, 54, 16, "#7CFC00")); // 12th one, green
    staticRenderables.push(new Rectangle(333.5, 20, 54, 115, "#0000ff")); // 13th one, blue
    staticRenderables.push(new Rectangle(333.5, 135, 190, 32, "#ff0000")); // 14th one, red

    staticRenderables.push(new Rectangle(387.5, 2.0, 136, 16, "#0000ff")); // 15th one, blue
    staticRenderables.push(new Rectangle(387.5, 277.5, 136, 74, "#7CFC00")); // 16th one, green

    staticRenderables.push(new Rectangle(525, 350, 40, 23, "#ff0000")); // 17th one, red

    staticRenderables.push(new Rectangle(566.5, 2.0, 31.5, 23, "#7CFC00")); // 18th one, green
    staticRenderables.push(new Rectangle(566.5, 17.5, 31.5, 47, "#ff0000")); // 19th one, red
    staticRenderables.push(new Rectangle(566.5, 221.5, 31.5, 129, "#7CFC00")); // 20th one, green

    // Lines 
    staticRenderables.push(new Line(37.5, 0, 37.5, canvas.height)); // 1st vertical line, left of player
    staticRenderables.push(new Line(80.0, 0, 80.0, canvas.height)); // 2nd vertical line, right of player
    staticRenderables.push(new Line(205.0, 0, 205.0, canvas.height)); // 3rd vertical line
    staticRenderables.push(new Line(230.5, 0, 230.5, canvas.height)); // 4th vertical line
    staticRenderables.push(new Line(335.0, 0, 335.0, canvas.height)); // 5th vertical line
    staticRenderables.push(new Line(385.5, 0, 385.5, canvas.height)); // 6th vertical line
    staticRenderables.push(new Line(525.0, 0, 525.0, canvas.height)); // 7th vertical line, left of player
    staticRenderables.push(new Line(566.5, 0, 566.5, canvas.height)); // 8th vertical line, right of player

    staticRenderables.push(new Line(0, 17.5, canvas.width, 17.5)); // 1st horizontal line
    staticRenderables.push(new Line(0, 351.0, canvas.width, 351.0)); // 2nd horizontal line

    // First separate line block
    staticRenderables.push(new Line(0, 64.0, 37.5, 64.0));
    staticRenderables.push(new Line(0, 221.0, 37.5, 221.0));

    // Second separate line block
    staticRenderables.push(new Line(37.5, 110.5, 80.0, 110.5)); // 1st block

    // remaining filler lines
    staticRenderables.push(new Line(79, 135.5, 525, 135.5));
    staticRenderables.push(new Line(79, 167.5, 525, 167.5));

    staticRenderables.push(new Line(80.0, 200.0, 205.0, 200.0));
    staticRenderables.push(new Line(385.5, 277.5, 525.0, 277.5));

    staticRenderables.push(new Line(566.5, 63.0, canvas.width, 63.0));
    staticRenderables.push(new Line(566.5, 221.0, canvas.width, 221.0));
    staticRenderables.prepare();

    var dot = new Dot(100, 100, 7, 3.7);

    // Add the static layer
    renderables.push(staticRenderables);

    // Add the dot and players 
    renderables.push(dot);
    renderables.push(new SimulatedPlayer(-1, dot));
    renderables.push(new SimulatedPlayer(1, dot));

    function animation() {

        // Step & render!
        for (var i in renderables) renderables[i].step(canvas.width, canvas.height);
        for (var i in renderables) renderables[i].draw(context);

        requestAnimationFrame(animation);
    }

    animation();

});