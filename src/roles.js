var behavior = require('behavior');

function builder(creep) {
    var stateMap = {
        'needsEnergy': behavior.energyPickup,
        'hasEnergy': behavior.build,
        'build': behavior.build,
        'repair': behavior.repair,
        'mine': behavior.mine,
        'idle': behavior.coalesceIdle([behavior.build, behavior.repair])
    };
    behavior.creepStep(creep, stateMap);
}

function harvester(creep) {
    var stateMap = {
        'mine': behavior.mine,
        'hasEnergy': behavior.energyTransfer({containers: 0, spawns: 2, towers: 1}),
        'needsEnergy': behavior.mine,
        'idle': behavior.mine
    };
    behavior.creepStep(creep, stateMap);
}

function hauler(creep) {
    var stateMap = {
        'needsEnergy': behavior.energyPickup,
        'hasEnergy': behavior.energyTransfer({containers: 2, spawns: 0, towers: 1}),
        'idle': behavior.energyPickup
    };
    behavior.creepStep(creep, stateMap);
}

function janitor(creep) {
    var stateMap = {
        'needsEnergy': behavior.energyPickup,
        'hasEnergy': behavior.repair,
        'repair': behavior.repair,
        'mine': behavior.mine,
        'idle': behavior.repair
    };
    behavior.creepStep(creep, stateMap);
}

function upgrader(creep) {
    var stateMap = {
        'needsEnergy': behavior.energyPickup,
        'hasEnergy': behavior.upgrade,
        'upgrade': behavior.upgrade,
        'mine': behavior.mine,
        'idle': behavior.upgrade
    };
    behavior.creepStep(creep, stateMap);
}
module.exports = {
    builder,
    harvester,
    hauler,
    janitor,
    upgrader
}