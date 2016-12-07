var behavior = require('behavior');

const builder = {
    'needsEnergy': behavior.energyPickup,
    'hasEnergy': behavior.build,
    'build': behavior.build,
    'repair': behavior.repair,
    'mine': behavior.mine,
    'idle': behavior.coalesceIdle([behavior.build, behavior.repair])
};

const harvester = {
    'mine': behavior.mine,
    'hasEnergy': behavior.energyTransfer({containers: 0, spawns: 2, towers: 1}),
    'needsEnergy': behavior.mine,
    'idle': behavior.mine
};

const hauler = {
    'needsEnergy': behavior.energyPickup,
    'hasEnergy': behavior.energyTransfer({containers: 2, spawns: 0, towers: 1}),
    'idle': behavior.energyPickup
};

const janitor = {
    'needsEnergy': behavior.energyPickup,
    'hasEnergy': behavior.repair,
    'repair': behavior.repair,
    'mine': behavior.mine,
    'idle': behavior.repair
};


const upgrader = {
    'needsEnergy': behavior.energyPickup,
    'hasEnergy': behavior.upgrade,
    'upgrade': behavior.upgrade,
    'mine': behavior.mine,
    'idle': behavior.upgrade
};

module.exports = {
    builder,
    harvester,
    hauler,
    janitor,
    upgrader
}