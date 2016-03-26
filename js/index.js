var Engine = Matter.Engine;
var Events = Matter.Events;
var World = Matter.World;
var Body = Matter.Body;
var Bodies = Matter.Bodies;

window.onload = function() {

    var game = {};

    // Create instance of matter.js engine
    var engine = Engine.create({
        render: {
            element: document.body,
            options: {
                width: config.canvas.width,
                height: config.canvas.height,
                wireframes: false
            }
        }
    });
    game.engine = engine;

    // Disable gravity
    engine.world.gravity.y = 0;

    // Create game objects
    createObjects(game);

    // Maintain keyboard state
    var keyStates = {};
    game.keyStates = keyStates;
    document.onkeydown = function(evt) {
        keyStates[evt.keyCode] = true;
    };
    document.onkeyup = function(evt) {
        delete keyStates[evt.keyCode];
    };

    Events.on(engine, 'beforeUpdate', function(evt) {
        update(game);
    });

    // run the engine
    Engine.run(engine);

};

function createObjects(game) {
    var engine = game.engine;
    var w = config.canvas.width;
    var h = config.canvas.height;
    // Top
    createWall(engine, w / 2, 5, w, 10);
    // Bottom
    createWall(engine, w / 2, h - 5, w, 10);
    // Left
    createWall(engine, 5, 65, 10, 110);
    createWall(engine, 5, h - 65, 10, 110);
    // Right
    createWall(engine, w - 5, 65, 10, 110);
    createWall(engine, w - 5, h - 64, 10, 110);
    // Create the paddles
    game.paddleA = createPaddle(engine, 100, h / 2);
    game.paddleB = createPaddle(engine, w - 100, h / 2);
    // Create the puck
    game.puck = createPuck(engine, w / 2, h / 2);
}

function createWall(engine, x, y, w, h) {
    var body = Bodies.rectangle(x, y, w, h, {isStatic: true});
    body.render.fillStyle = config.walls.color;
    body.render.strokeStyle = body.render.fillStyle;
    World.add(engine.world, [body]);
    return body;
}

function createPaddle(engine, x, y) {
    var body = Bodies.circle(x, y, 40);
    body.mass = 100;
    body.frictionAir = 0.15;
    body.render.fillStyle = config.paddles.color;
    body.render.strokeStyle = body.render.fillStyle;
    World.add(engine.world, [body]);
    return body;
}

function createPuck(engine, x, y) {
    var body = Bodies.circle(x, y, 30);
    body.restitution = 1;
    body.frictionAir = 0.001;
    body.render.fillStyle = config.puck.color;
    body.render.strokeStyle = body.render.fillStyle;
    World.add(engine.world, [body]);
    return body;
}

function update(game) {
    var f = 0.5;
    var force = {x: 0, y: 0};
    if (game.keyStates[38]) {
        force.y -= f;
    }
    if (game.keyStates[39]) {
        force.x += f;
    }
    if (game.keyStates[40]) {
        force.y += f;
    }
    if (game.keyStates[37]) {
        force.x -= f;
    }
    Body.applyForce(game.paddleA, game.paddleA.position, force);
}
