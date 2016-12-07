var population = require('population');

function list() {
    var creeps = Game.creeps;
    
    for(var creep in creeps) {
        var role = creeps[creep].memory.role;
        console.log(creep + ": " + role);
        creeps[creep].say(role);
    }
}

function energy() {
    for(var name in Game.rooms) {
        console.log('Room "'+name+'" has '+Game.rooms[name].energyAvailable+' energy');
    }
}

function spawn(spawnName, role, body) {
    return population.spawnCreep(Game.spawns[spawnName], role, body);
}

function recalcNodes() {
    for (var name in Game.creeps) {
        if (Game.creeps[name].memory.targetSource) {
            Game.creeps[name].memory.targetSource = undefined;
        }
    }
}

module.exports = {
    spawn,
    list,
    energy,
    cost: population.getCost,
    recalcNodes
};