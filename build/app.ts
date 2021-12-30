let Square = (nb: number) => nb*nb;



const canvas = document.querySelector("canvas") || document.createElement("canvas");
const c = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;



function  getMousePos(canvas: HTMLCanvasElement, evt: any) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
    scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
    
    return {
        x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
        y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
}

function random(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min +1)) + min;
}

let mouse = {
    x: 0, 
    y: 0
};

const inputs = {
    left: false,
    right: false,
    top: false,
    bottom: false,
};

function setListeners() {
    window.addEventListener("keydown", (e)=>{
        if(e.key === "q")   inputs.left = true;
        if(e.key === "d")  inputs.right = true;
        if(e.key === "z")     inputs.top = true;
        if(e.key === "s")   inputs.bottom = true;
        
        // console.log(e.key);
    });
    window.addEventListener("keyup", (e)=>{
        if(e.key === "q")   inputs.left = false;
        if(e.key === "d")  inputs.right = false;
        if(e.key === "z")     inputs.top = false;
        if(e.key === "s")   inputs.bottom = false;
        // console.log(e.key);
    });
    window.addEventListener("mousemove", (e)=>{
        mouse = getMousePos(canvas, e);
    });
}
setListeners();

class PVector {
    x: number;
    y: number;
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    set (PVector: PVector) {
        this.x = PVector.x;
        this.y = PVector.y;
    }

    add (PVector: PVector) {
        this.x += PVector.x;
        this.y += PVector.y;
    }

    sub (PVector: PVector) {
        this.x += -PVector.x;
        this.y += -PVector.y;
    }

    mult (number: number) {
        this.x *= number;
        this.y *= number;
    }

    div (number: number) {
        this.x /= number;
        this.y /= number;
    }

    mag (){
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    normalize (){
        let m = this.mag();
        if (m != 0) {
            this.div(m);
        }
    }

    limit (max: number){
        if (this.mag() > max) {
            // console.log('prout');
            this.normalize();
            this.mult(max);
        }
    }

    random2D(){
        this.set(new PVector(random(-800, canvas.width), random(-500, canvas.height)));
        this.normalize();
        // console.log(this.x, this.y);
        // setTimeout(console.clear, 1000)
        
        // console.log(this);
        
    }



    // STATIC METHOD
    static addi(v1: PVector, v2: PVector){
        const v3 = new PVector(v1.x + v2.x, v1.y + v2.y);
        return v3;
    }

    static subi(v1: PVector, v2: PVector){
        const v3 = new PVector(v1.x - v2.x, v1.y - v2.y);
        return v3;
    }

    static multi(v1: PVector, number: number){
        const v3 = new PVector(v1.x * number, v1.y * number);
        return v3;
    }
    
    static divi(v1: PVector, number: number){
        const v3 = new PVector(v1.x / number, v1.y / number);
        return v3;
    }

    static disti(v1: PVector, v2: PVector){
        return Math.sqrt(Square(v2.x - v1.x) + Square(v2.y - v1.y));
    }
}


class Mover {
    locat: PVector;
    velocity: PVector;
    acceleration: PVector;
    dir: PVector;
    mouse: PVector;

    id: number | null;
    topSpeed: number;

    constructor(id: number | null = null){
        // console.log('Constructeur mover');
        this.locat = new PVector(random(0, canvas.width), random(0, canvas.height));
        this.velocity = new PVector();
        this.acceleration = new PVector();

        this.topSpeed = 5;
        this.dir = new PVector();
        this.mouse = new PVector();

        this.id = id;

        
    }

    update (){
        // this.mouse.set(new PVector(mouse.x, mouse.y));
    }

    checkEdges() {
 
        if (this.locat.x > canvas.width) {
            // this.locat.x = 0;
            this.velocity.x = -this.velocity.x
        } else if (this.locat.x < 0) {
            // this.locat.x = canvas.width;
            this.velocity.x = -this.velocity.x
        }
        
        if (this.locat.y > canvas.height) {
            // this.locat.y = 0;
            this.velocity.y = -this.velocity.y
        } else if (this.locat.y < 0) {
            // this.locat.y = canvas.height;
            this.velocity.y = -this.velocity.y
        }
         
    }

    display () {
        if(!c) return;
        c.beginPath();
        c.arc(this.locat.x, this.locat.y, 10, 0, Math.PI * 2);
        c.lineWidth = 1;
        c.stroke();
        c.fillStyle = "green";
        c.fill();
    }

    findNearest(movers: Mover[]){
        let best = 99999999;
        let nearest : Mover | null = null;
        for (const mover of movers) {
            if(mover.id == this.id) continue;
            let current = PVector.disti(this.locat, mover.locat);
            // console.log(current)
            if(current < best) {
                best = current;
                nearest = mover;
            }

        }
            if(nearest){
                line(this.locat, nearest.locat);
                if(best < 10){
                    let slow = this.acceleration;
                    slow.mult(10);
                    this.velocity.sub(slow);
                    slow.div(10);
                }
            }
        // if(best != 0) console.log(best);
        // console.log(movers)
    }

    lookAt(pos: PVector){
        return PVector.subi(pos, this.locat);
    }
}

class Player extends Mover {
    isMoving: boolean;
    range: number;
    constructor(){
        super();
        this.isMoving = false;
        this.range = 100;
        // this.mouse.set(new PVector(mouse.x, mouse.y));
    }

    move(){
        
        
        // INPUT CONTROL
        let rotateSpeed = 10;
        if (inputs.left)    this.dir.add(new PVector(-rotateSpeed, 0));
        if (inputs.right)   this.dir.add(new PVector(rotateSpeed, 0));
        if (inputs.top)     this.dir.add(new PVector(0, -rotateSpeed));
        if (inputs.bottom)  this.dir.add(new PVector(0, rotateSpeed));

        if(inputs.left || inputs.right || inputs.top || inputs.bottom)
        this.isMoving = true;
        else this.isMoving = false;
        
        this.mouse.set(new PVector(mouse.x, mouse.y));

        this.dir.normalize();
        this.dir.mult(1);

        let lookAt = this.lookAt(this.mouse);
        lookAt.normalize();
        let d = PVector.disti(this.locat, this.mouse);
        if(d <= this.range + 20)
        lookAt.mult(d - 20);
        else lookAt.mult(this.range);

        if(c){
            
            c.beginPath();
            c.arc(this.locat.x, this.locat.y, this.range + 10, 0, Math.PI * 2);
            c.lineWidth = 5;
            c.fillStyle = "transparent"
            c.strokeStyle = "black"
            c.stroke();
            c.fill();
        }
        
        line(this.locat, PVector.addi(this.locat, lookAt));

        this.acceleration = this.dir;
        
        this.velocity.add(this.acceleration);
        this.velocity.limit(5)
        
        if(this.isMoving)
        this.locat.add(this.velocity);
    }

    shoot(){
        console.log("Fire !")
        let bullet = new Bullet();
        bullets.push(bullet)
    }
}

class Bullet extends Mover {

    constructor(){
        super();
        
        this.locat = new PVector(player.locat.x, player.locat.y)
        this.mouse.set(new PVector(mouse.x, mouse.y));

        let lookAt = this.lookAt(this.mouse);
        this.dir = lookAt;
        this.dir.normalize()
        this.dir.mult(10);
        
        console.log("Bullet created")
        
    }

    move(){
        // let lookAt = this.lookAt(this.mouse);
        // lookAt.normalize()
        // lookAt.mult(10)
        // lookAt.mult(1.1)
        // line(this.locat, lookAt, "violet");
        
        line(this.locat, PVector.addi(this.locat, this.dir), "pink");

        this.acceleration = this.dir;
        
        this.velocity.add(this.acceleration);
        this.velocity.limit(5)
        this.locat.add(this.velocity);
    }

}

const player = new Player();
let bullets: Bullet[] = [];
// let b = new Bullet();
// bullets.push(b);

document.addEventListener("mousedown", () => player.shoot())


const v = new PVector(200, 200);
v.normalize();
v.mult(100);

const u = new PVector(200, 100);
u.normalize();
u.mult(100)

const w = new PVector(100, 200);
w.normalize();
w.mult(100)

const center = new PVector(canvas.width / 2, canvas.height / 2);
const Origin = new PVector(0, 0);



// const mover = new Mover();



function draw() {
    
    
    // for (let mover of circleArray) {
    //     mover.update();
    //     mover.checkEdges();
    //     mover.display();
    //     mover.findNearest(circleArray);
    // }

   

    for (const bullet of bullets) {
        bullet.update();
        bullet.move();
        // bullet.display();
    }

    player.update();
    player.move();
    player.display();
    
    mouseDisplay();
    // mover.update();
    // mover.checkEdges();
    // mover.display();

    line(Origin, v, "red");
    line(Origin, u, "green");
    line(Origin, w, "yellow");
}

function animate() {
    requestAnimationFrame(animate);

    if(!c) return;
    c.clearRect(0, 0, canvas.width, canvas.height);

    draw();
    // console.log(inputs);
}


animate();














function line(startVector: PVector, endVector: PVector, color: string = "blue") {
    if(!c) return;
    c.beginPath();
    c.moveTo(startVector.x, startVector.y);
    c.lineTo(endVector.x, endVector.y);
    c.lineWidth = 5;
    c.fillStyle = color;
    c.strokeStyle = color;
    c.stroke();
}

function mouseDisplay() {
    if(!c) return;
    c.beginPath();
    c.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
    c.lineWidth = 1;
    c.stroke();
    c.fillStyle = "blue";
    c.fill();
}