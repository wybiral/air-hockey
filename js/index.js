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
            element: document.querySelector('body > main'),
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

    // Create neural network
    game.network = new synaptic.Architect.Perceptron(10, 30, 4);
    // Set hidden activation function to TANH
    var hiddenLayers = game.network.layers.hidden;
    for (var i = 0; i < hiddenLayers.length; i++) {
        var hidden = hiddenLayers[i].list;
        for (var j = 0; j < hidden.length; j++) {
            hidden[j].squash = synaptic.Neuron.squash.TANH;
        }
    }

    // Training data for network
    game.trainData = [];

    // Maintain keyboard state
    var keyStates = {};
    game.keyStates = keyStates;
    document.onkeydown = function(evt) {
        keyStates[evt.keyCode] = true;
    };
    document.onkeyup = function(evt) {
        delete keyStates[evt.keyCode];
    };

    // Load button
    document.querySelector('#load-btn').onclick = function(evt) {
        loadNetwork(game);
    };

    // Save button
    document.querySelector('#save-btn').onclick = function(evt) {
        saveNetwork(game);
    };

    // Randomize button
    document.querySelector('#randomize-btn').onclick = function(evt) {
        randomizeGame(game);
    };

    // Listen for update event
    Events.on(engine, 'beforeUpdate', function(evt) {
        update(game);
    });

    // run the engine
    Engine.run(engine);

};

/*
"Upload" a file and load as a JSON synaptic network
*/
function loadNetwork(game) {
    var input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.onchange = function(evt) {
        var file = evt.target.files[0];
        var reader = new FileReader();
        reader.addEventListener('loadend', function (evt) {
        if (evt.target.readyState == FileReader.DONE) {
            var json = JSON.parse(evt.target.result);
            game.network = synaptic.Network.fromJSON(json);
        }
        });
        reader.readAsText(file);
    };
    input.click();
}

/*
Export a synaptic network as JSON and create "download" from it
*/
function saveNetwork(game) {
    var blob = new Blob([JSON.stringify(game.network)]);
    var a = document.createElement('a');
    document.body.appendChild(a);
    a.setAttribute('href', URL.createObjectURL(blob));
    a.setAttribute('download', 'network.json');
    a.click();
    document.body.removeChild(a);
}

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
    updateNetwork(game);
    updatePaddleA(game);
    updatePaddleB(game);
    updatePuck(game);
}

function randomizeGame(game) {
    var w = config.canvas.width;
    var h = config.canvas.height;
    Body.setPosition(game.paddleA, {
        x: Math.random() * w / 2,
        y: Math.random() * h
    });
    Body.setPosition(game.paddleB, {
        x: w - Math.random() * w / 2,
        y: Math.random() * h
    });
    Body.setPosition(game.puck, {
        x: Math.random() * w,
        y: Math.random() * h
    });
    Body.setVelocity(game.puck, {
        x: Math.random() * 20 - 10,
        y: Math.random() * 20 - 10
    });
}

function updatePaddleA(game) {
    var f = 0.5;
    var force = {x: 0, y: 0};
    var paddleA = game.paddleA;
    var directions = [0, 0, 0, 0];
    if (game.keyStates[38]) {
        force.y -= f;
        directions[0] = 1;
    }
    if (game.keyStates[39]) {
        force.x += f;
        directions[1] = 1;
    }
    if (game.keyStates[40]) {
        force.y += f;
        directions[2] = 1;
    }
    if (game.keyStates[37]) {
        force.x -= f;
        directions[3] = 1;
    }
    if (directions[0] || directions[1] || directions[2] || directions[3]) {
        pushTrainSample(game, directions);
        Body.applyForce(paddleA, paddleA.position, force);
    }
    if (paddleA.position.x > config.canvas.width / 2 - 40) {
        // Keep paddle on correct side
        var offset = (config.canvas.width / 2 - 40) - paddleA.position.x;
        Body.applyForce(paddleA, paddleA.position, {x: offset * 0.05, y: 0});
    }
    if (paddleA.position.x < 40) {
        // Keep paddle out of goal
        var offset = 40 - paddleA.position.x;
        Body.applyForce(paddleA, paddleA.position, {x: offset * 0.05, y: 0});
    }
}

function pushTrainSample(game, directions) {
    var w = config.canvas.width;
    var h = config.canvas.height;
    var vScale = 0.1;
    var paddleA = game.paddleA;
    var paddleB = game.paddleB;
    var puck = game.puck;
    var inputs = [
        (puck.position.x - paddleA.position.x) / w,
        (puck.position.y - paddleA.position.y) / h,
        2 * paddleA.position.x / w - 1,
        2 * paddleA.position.y / h - 1,
        2 * paddleB.position.x / w - 1,
        2 * paddleB.position.y / h - 1,
        2 * puck.position.x / w - 1,
        2 * puck.position.y / h - 1,
        puck.velocity.x * vScale,
        puck.velocity.y * vScale
    ];
    game.trainData.push([inputs, directions]);
    while (game.trainData.length > 1000000) {
        // Only remember a max of 1M samples at a time
        var index = (Math.random() * game.trainData.length) | 0;
        game.trainData.splice(index, 1);
    }
}

function updateNetwork(game) {
    var network = game.network;
    var trainData = game.trainData;
    var n = trainData.length;
    if (n > 100) {
        for (var i = 0; i < 100; i++) {
            var index = (Math.random() * n) | 0;
            network.activate(trainData[index][0]);
            network.propagate(0.1, trainData[index][1]);
        }
    }
}

function updatePaddleB(game) {
    var w = config.canvas.width;
    var h = config.canvas.height;
    var vScale = 0.1;
    var paddleA = game.paddleA;
    var paddleB = game.paddleB;
    var puck = game.puck;
    var inputs = [
        -(puck.position.x - paddleB.position.x) / w,
        (puck.position.y - paddleB.position.y) / h,
        -(2 * paddleB.position.x / w - 1),
        2 * paddleB.position.y / h - 1,
        -(2 * paddleA.position.x / w - 1),
        2 * paddleA.position.y / h - 1,
        -(2 * puck.position.x / w - 1),
        2 * puck.position.y / h - 1,
        -puck.velocity.x * vScale,
        puck.velocity.y * vScale
    ];
    var directions = game.network.activate(inputs);
    var f = 0.5;
    var force = {x: 0, y: 0};
    if (directions[0] > 0.9) {
        force.y -= f;
    }
    if (directions[3] > 0.9) {
        force.x += f;
    }
    if (directions[2] > 0.9) {
        force.y += f;
    }
    if (directions[1] > 0.9) {
        force.x -= f;
    }
    Body.applyForce(paddleB, paddleB.position, force);

    if (paddleB.position.x < config.canvas.width / 2 + 40) {
        // Keep paddle on correct side
        var offset = (config.canvas.width / 2 + 40) - paddleB.position.x;
        Body.applyForce(paddleB, paddleB.position, {x: offset * 0.05, y: 0});
    }
    if (paddleB.position.x > config.canvas.width - 40) {
        // Keep paddle out of goal
        var offset = (config.canvas.width - 40) - paddleB.position.x;
        Body.applyForce(paddleB, paddleB.position, {x: offset * 0.05, y: 0});
    }
}

function updatePuck(game) {
    var puck = game.puck;
    if (puck.position.x < -30) {
        randomizeGame(game);
    }
    if (puck.position.x > config.canvas.width + 30) {
        randomizeGame(game);
    }
}
