var population = require("population");

const buildOrderList = [ 'harvester', 'harvester', 'builder', 'upgrader', 'harvester', 'builder', 'upgrader' ];

function followBuildOrder(room, spawners, creeps, buildOrder) {
    if (creeps.length == buildOrder.length) {
        return;
    }
    const levels = population.getPopulationLevels(creeps);
    for (var i = 0; i < buildOrder.length; i++) {
        const role = buildOrder[i];
        let count = levels[role] || 0;
        if (count == 0) {
            let body = population.determineBody(room, role);
            let result = population.spawnCreep(spawners, role, body);
            if (result == ERR_NOT_ENOUGH_ENERGY) {
                room.memory.spawning = true;
            } else {
                room.memory.spawning = false;
            }
            return result;
        } else {
            levels[role]--;
        }
    }
}

function manage(room, spawners, creeps) {
    followBuildOrder(room, spawners, creeps, buildOrderList);
}

module.exports = {
    manage
};