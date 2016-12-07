var population = require('population');
var roles = require('roles');
var level1 = require('level1');

function getNodes(obj, excludes = []) {
    if (!(obj instanceof Room)) {
        obj = obj.room;
    }
    const sources = obj.find(FIND_SOURCES, {
        filter: function (n) {
            for (var i = 0; i < excludes.length; i++) {
                if (n.pos.x == excludes[i].x && n.pos.y == excludes[i].y) {
                    return false;
                }
            }
            return true;
        }
    });
    return _.reduce(sources, (result, source) => {
        result[source.id] = { id: source.id, count: 0, pos: source.pos };
        return result;
    }, {});
}

function closestNodesToObject(obj, nodes, excludes) {
    return _.sortBy(nodeMap, function(n) {
        return obj.pos.getRangeTo(nodes[n.id]);
    });
}

function getRoomSpawns(room) {
    return room.find(FIND_MY_STRUCTURES, {
        filter: (s) => { 
            return s.structureType == STRUCTURE_SPAWN;
        }
    });
}

function run(room) {
    if (!room.memory.sources) {
        room.memory.sources = getNodes(room, room.memory.excludeNodes);
    }
    var creeps = room.find(FIND_MY_CREEPS, {
        filter: (c) => { return c.memory.owner == room.name }
    });
    var spawners = getRoomSpawns(room);
    if (spawners) {
        level1.manage(room, spawners, creeps);
    }
    _.forEach(creeps, function(creep) {
        var roleFunc = roles[creep.memory.role];
        if (!roleFunc) {
            console.log("Unknown role " + creep.memory.role + " for creep " + name);
        } else {
            roleFunc(creep);
        }
    });
}

module.exports = {
    run
};