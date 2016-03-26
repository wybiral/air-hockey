var Engine = Matter.Engine;
var Events = Matter.Events;
var World = Matter.World;
var Body = Matter.Body;
var Bodies = Matter.Bodies;

window.onload = function() {

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

    // Disable gravity
    engine.world.gravity.y = 0;

    // Create shapes for walls
    createWalls(engine);

    // run the engine
    Engine.run(engine);

};

function createWalls(engine) {
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
}

function createWall(engine, x, y, w, h) {
    var body = Bodies.rectangle(x, y, w, h, {isStatic: true});
    body.render.fillStyle = '#aaa';
    body.render.strokeStyle = body.render.fillStyle;
    World.add(engine.world, [body]);
    return body;
}
