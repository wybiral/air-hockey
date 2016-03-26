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

};
