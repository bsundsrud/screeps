var err = require('err');
 

function getDesiredPopulationLevels(room) {
    const nodeCount = _.size(room.memory.sources);
    return {
        harvester: {
            weight: (pop) => { 
                const h = pop.harvester || 0;
                if (h >= (2 * nodeCount)) {
                    return null;
                }
                return 15;
            }
        },
        upgrader: {
            weight: (pop) => { return 5 - (pop.upgrader || 0) }
        },
        builder: {
            weight: (pop) => { return 6 - (pop.builder || 0) }
        },
        hauler: {
            weight: (pop) => { return (pop.harvester || 0) - (pop.hauler || 0) }
        }
    }
}

const tiersByCost = {
    harvester: [
        [450, [WORK, WORK, MOVE, MOVE, MOVE, CARRY, CARRY]],
        [250, [WORK, MOVE, MOVE, CARRY]]
    ],
    upgrader: [
        [250, [WORK, MOVE, MOVE, CARRY]]
    ],
    builder: [
        [250, [WORK, MOVE, MOVE, CARRY]]
    ],
    janitor: [
        [250, [WORK, MOVE, MOVE, CARRY]]
    ],
    hauler: [
        [200, [MOVE, MOVE, CARRY, CARRY]]
    ]
};



function getCost(body) {
    return _.reduce(body, (acc, part) => { return acc + BODYPART_COST[part] }, 0);
}


function spawnCreep(spawners, ty, body) {
    const availableSpawners = _.filter(spawners, (s) => { return s.spawning == null });
    if (!availableSpawners.length) {
        return ERR_BUSY;
    }
    const spawner = availableSpawners[0];
    var canCreate = spawner.canCreateCreep(body);
    if (canCreate == OK) {
        console.log("Spawning " + ty + JSON.stringify(body) + " from " + spawner.name);
        return spawner.createCreep(body, undefined, {role: ty, owner: spawner.room.name});
    } else {
        console.log("Could not spawn " + ty + JSON.stringify(body) + ": " + err(canCreate));
        return canCreate;
    }
}


function determineSpawn(room, popLevels) {
    var currentWeights = _.map(getDesiredPopulationLevels(room), (p, role) => { 
        return {
            role,
            weight: p.weight(popLevels)
        };
    });
    currentWeights = _.filter(currentWeights, (o) => { return o.weight !== null });
    var order = _.sortBy(currentWeights, (r) => { return r.weight; });
    order.reverse();
    if (order.length) {
        return order[0].role;
    }
    return null;
}

function getPopulationLevels(creeps) {
    return _.reduce(creeps, function(result, creep) {
        if (!result[creep.memory.role]) {
            result[creep.memory.role] = 1;
        } else {
            result[creep.memory.role]++;
        }
        return result;
    }, {});
}

function determineBody(room, role) {
    const tiers = tiersByCost[role];
    for (var i = 0; i < tiers.length; i++) {
        if (tiers[i][0] <= room.energyCapacityAvailable) {
            //return the best body for the available capacity
            return tiers[i][1];
        }
    }
    //cannot afford any of the bodies right now
    return null;
}

function redistributeSources(room, creeps) {
    
}

function check(room, spawners, creeps) {
    var popLevels = _.reduce(creeps, function(result, creep) {
        if (!result[creep.memory.role]) {
            result[creep.memory.role] = 1;
        } else {
            result[creep.memory.role]++;
        }
        return result;
    }, {});
    const role = determineSpawn(room, popLevels);
    if (role) {
        console.log("spawning " + role);
        const body = determineBody(room, role);
        spawnCreep(spawners, role, body);
    }
}
module.exports = {
    check,
    spawnCreep,
    getCost,
    getPopulationLevels,
    determineBody,
    redistributeSources
};