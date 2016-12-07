var err = require('err');

function creepStep(creep, stateMapping, initialState = (creep) => { return { name: 'idle' }; }) {
    if (!creep.memory.state) {
        creep.memory.state = initialState(creep);
    }
    let stateFunc = stateMapping[creep.memory.state.name];
    if (!stateFunc) {
        console.log(creep.name + ": Did not handle " + creep.memory.state.name + ", starting over");
        creep.memory.state = initialState(creep);
    } else {
        creep.memory.state = stateFunc(creep);
    }
}

function coalesceIdle(funcs) {
    return function(creep) {
        for (var i = 0; i < funcs.length; i++) {
            const stateFunc = funcs[i];
            const result = stateFunc(creep);
            if (result.name != 'idle') {
                return result;
            } 
        }
        return {
            name: 'idle'
        };
    }
}

function getNodeDistribution(room, sources) {
    const creeps = room.find(FIND_MY_CREEPS, {
        filter: (c) => { return c.memory.owner == room.name }
    });
    for (var s in sources) {
        sources[s].count = 0;
    }
    return _.reduce(creeps, function(result, c) {
        if (!c.memory.targetSource) {
            return result;
        }
        var val = result[c.memory.targetSource].count || 0;
        result[c.memory.targetSource].count = val + 1;
        return result;
    }, sources);
}

function pickNode(creep) {
    const sources = creep.room.memory.sources;
    const distribution = getNodeDistribution(creep.room, sources);
    const min = _.reduce(distribution, (min, o) => {
        return (!min || o.count < min) ? o.count : min;
    }, undefined);
    var filtered = [];
    if (creep.memory.role != 'harvester') {
        filtered = _.reject(distribution, (o) => { return o.count >= (min + 3) });
        if (!filtered.length) {
            return null;
        }
    } else {
        filtered = distribution;
    }
    const nearest = _.sortBy(filtered, (source) => {
        return creep.pos.getRangeTo(source.pos.x, source.pos.y);
    });
    return nearest[0].id;
}

function pickStorageTarget(creep, opts = {containers: 0, spawns: 1, towers: 2}) {
    var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            if (structure.structureType == STRUCTURE_CONTAINER && _.sum(structure.store) < structure.storeCapacity) {
                return true;
            }
            return (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
        }
    });
    if (!targets.length) {
        return undefined;
    }
    return _.sortBy(targets, (s) => { 
        if (s.structureType == STRUCTURE_CONTAINER) {
            return opts.containers;
        } else if (s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_SPAWN) {
            if (creep.room.memory.spawning) {
                return opts.spawns - 3;
            }
            return opts.spawns;
        } else if (s.structureType == STRUCTURE_TOWER) {
            return opts.towers;
        }
    })[0];
}

function findStoragePickupTarget(creep) {
    var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0;
        }
    });
    if (!targets.length) {
        if ((!creep.room.memory.spawning && creep.room.energyAvailable / creep.room.energyCapacityAvailable) > 0.5) {
            targets = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (s) => {
                    return (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) &&
                        ((s.energy / s.energyCapacity) > 0.5);
                }
            });
        }
    }
    if (!targets.length) {
        return null;
    }
    return creep.pos.findClosestByPath(targets);
}

function energyPickup(creep) {
    if (creep.carry.energy == 0) {
        var target = findStoragePickupTarget(creep);
        if (target === null) {
            return {
                name: 'mine'
            };
        }
        var result = creep.withdraw(target, RESOURCE_ENERGY);
        if (result == ERR_NOT_IN_RANGE) {
            return move(creep, 'needsEnergy', target);
        }
        if (creep.carry.energy < creep.carryCapacity) {
            return {
                name: 'needsEnergy'
            };
        } 
    }
    return {
        name: 'hasEnergy'
    };
}

function upgrade(creep) {
    if (creep.carry.energy == 0) {
        return {
            name: 'needsEnergy'
        };
    }
    if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        return move(creep, 'upgrade', creep.room.controller);
    }
    return {
        name: 'upgrade'
    };
}

function repair(creep) {
    if (creep.carry.energy == 0) {
        return {
            name: 'needsEnergy'
        };
    }
    var damagedStructures = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.hits < structure.hitsMax
    });
    if (!damagedStructures) {
        return {
            name: 'idle'
        };
    }
    var target = _.sortBy(damagedStructures, (st) => (st.hits / st.hitsMax))[0];
    var result = creep.repair(target);
    if (result == ERR_NOT_IN_RANGE) {
        return move(creep, 'repair', target);
    } else if (result == ERR_INVALID_TARGET) {
        return {
            name: 'idle'
        };
    }
    return {
        name: 'repair'
    };
}

function build(creep) {
    if (creep.carry.energy == 0) {
        return {
            name: 'needsEnergy'
        };
    }
    var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
    if(targets.length) {
        var target = targets[0];
        if(creep.build(target) == ERR_NOT_IN_RANGE) {
            return move(creep, 'build', target);
        }
    } else {
        return {
            name: 'idle'
        };
    }
    return {
        name: 'build'
    };
}

function energyTransfer(opts = {containers: 0, spawns: 1, towers: 2}) {
    return function(creep) {
        var target = pickStorageTarget(creep, opts);
        var result = creep.transfer(target, RESOURCE_ENERGY);
        if (result == ERR_NOT_IN_RANGE) {
            return move(creep, 'hasEnergy', target);
        }
        return {
            name: 'needsEnergy'
        };
    };
}

function energyDropoff(creep) {
    var target = pickStorageTarget(creep);
    var result = creep.transfer(target, RESOURCE_ENERGY);
    if (result == ERR_NOT_IN_RANGE) {
        return move(creep, 'hasEnergy', target);
    }
    return {
        name: 'needsEnergy'
    };
}

function mine(creep) {
    if (creep.memory.targetSource == undefined) {
        creep.memory.targetSource = pickNode(creep);
    }
    if (creep.carry.energy == creep.carryCapacity) {
        return {
            name: 'hasEnergy'
        };
    }
    var target = Game.getObjectById(creep.memory.targetSource);
    var result = creep.harvest(target);
    if (result == ERR_NOT_IN_RANGE) {
        return move(creep, 'mine', target);
    }
    return {
        name: "mine"
    };
}

function shouldRecalcPath(creep) {
    if (!creep.memory.state || !creep.memory.state.path) {
        return true;
    }
    var prevPos = creep.memory.pos || {x: -1, y: -1, count: 0};
    if (creep.fatigue == 0 && prevPos.x == creep.pos.x && prevPos.y == creep.pos.y) {
        creep.memory.pos.count++;
        if (creep.memory.pos.count > 1) {
            creep.say("stuck");
            return true;
        } else {
            return false;
        }
    } 
    creep.memory.pos = { x: creep.pos.x, y: creep.pos.y, count: 0 };
    return false;
}

function move(creep, nextAction, destination) {
    var state = creep.memory.state || {};
    var path = state.path;
    if (shouldRecalcPath(creep)) {
        path = Room.serializePath(creep.pos.findPathTo(destination));
    }
    var moveResult = creep.moveByPath(path)
    return {
        name: nextAction,
        path: path
    }
}

module.exports = {
    pickNode,
    mine,
    move,
    energyDropoff,
    energyTransfer,
    creepStep,
    energyPickup,
    repair,
    build,
    coalesceIdle,
    upgrade
};