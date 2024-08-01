// based on Dan Shiffman's codingtrain Snake Game
// Coding Challenge #115: Snake Game Redux - https://youtu.be/OMoVcohRgZA

class Snake {
    constructor(){
        this.body = [];
        this.body[0] = createVector(30, floor(h/2));
        this.xDir = 0;
        this.yDir = 0;
        this.len = 0;
    }

    setDir(x, y) {
        this.xdir = x;
        this.ydir = y;
    }

    update() {
        let head = this.body[this.body.length-1].copy();
        this.body.shift();
        if(head.x > w) {
            head.x = 0;
        } else if (head.x < 0) {
            head.x = w;
        } else {
            head.x += this.xdir;
        }
        if(head.y > h) {
            head.y = 0;
        } else if (head.y < 0) {
            head.y = h;
        }
        head.y += this.ydir;
        this.body.push(head);
    }

    grow() {
        let head = this.body[this.body.length-1].copy();
        this.len+=10;
        this.body.push(head);
    }

    eat(pos) {
        let x = this.body[this.body.length-1].x;
        let y = this.body[this.body.length-1].y;
        if((x - pos.x) < 10 && (y - pos.y) < 10) {
            this.grow();
            return true;
        }
        return false;
    }

    show() {
        for(let i = 0; i < this.body.length; i++) {
            fill(255);
            noStroke();
            ellipse(this.body[i].x, this.body[i].y, 50, 50)
        }
    }

}