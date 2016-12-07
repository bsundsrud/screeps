var roomOverseer = require('roomOverseer');

function loop() {
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    const controlledRooms = _.filter(Game.rooms, (r) => { return r.controller.my });
    for (var roomName in controlledRooms) {
        var room = controlledRooms[roomName];
        roomOverseer.run(room);
    }
  
    // var tower = Game.getObjectById('5840539117512a974d575dac');
    // if(tower) {
    //     if (tower.energy > 500) {
    //         var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
    //             filter: (structure) => structure.hits < structure.hitsMax
    //         });
    //         if(closestDamagedStructure) {
    //             tower.repair(closestDamagedStructure);
    //         }
    //     }
    //     var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    //     if(closestHostile) {
    //         tower.attack(closestHostile);
    //     }
    // }
    
}
module.exports.loop = loop;