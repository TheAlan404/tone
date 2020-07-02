/* 
	Discord: Dennis_#3272
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

console.log("Loading Libraries...");

const mineflayer = require("mineflayer");
const mc = require("minecraft-protocol");
const chalk = require("chalk");
const db = require("quick.db");
const mcparser = require("minecraft-chat-packet");
const Chunk = require('prismarine-chunk')('1.12.2');
const Vec3 = require("vec3");
const flyingsquid = require("flying-squid");
const states = mc.states
let bot = null;

console.log("Libraries finished loading.");














console.log("Creating bot proxy server...");

var server = flyingsquid.createMCServer({
  'motd': 'A Minecraft Server \nRunning flying-squid',
  'port': 25566,
  'max-players': 10,
  'online-mode': false,
  'logging': true,
  'gameMode': 1,
  'difficulty': 1,
  'worldFolder':'world',
  'generation': {
    'name': 'superflat',
    'options':{
      'worldHeight': 80
    }
  },
  'kickTimeout': 10000,
  'plugins': {

  },
  'modpe': false,
  'view-distance': 10,
  'player-list-text': {
    'header':'Flying squid',
    'footer':'Test server'
  },
  'everybody-op': true,
  'max-entities': 100,
  'version': '1.12.2'
});



server.on("newPlayer", function(player){
	player.on("chat", function(msg){
		let cleanMsg = mcparser.removeColors(mcparser.parse(msg));
		server.broadcast(cleanMsg);
		if(cleanMsg == "*") {
			newBot("TeStTt");
			server.broadcast(">> OK.");
		};
		if(cleanMsg == "logChunk") {
			let cache = bot.getChunkCache();
			for(const chunkIndex in cache) {
				let data = cache[chunkIndex];
				if(data === undefined) return console.log("undef??");
				let keyXZ = chunkIndex.split(",");
				player.sendChunk({
					x: keyXZ[0],
					z: keyXZ[1],
					chunk: data
				}).catch((err) => console.log(err));
				console.log("Sent!");
			}
			console.log("Sent All!");
		};
		if(cleanMsg == "tpPos") {
			let cmd = "tp " + bot.entity.position.x + " " + bot.entity.position.y + " " + bot.entity.position.z
			console.log(cmd);
			server.broadcast(cmd);
			player.handleCommand(cmd);
		};
	});
	player.on("sendChunk", async function(data, cancelled){
		console.log("Requested: " + data.x + " // " + data.z);
		if(cancelled) return console.log("Cancelled");
		if(bot == null) return console.log("Bot null");
		if(!bot.ihavespawned) return console.log("Bot didnt spawn yet");
		let pos = (data.x * 16) + "," + (data.z * 16);
		if(!bot.getChunkCache()[pos]) return console.log("Chunk is not in cache! -> " + bot.getChunkCache()[pos]);
		if(bot.getChunkCache()[pos] === null) return console.log("Chunk is null in cache");
		data.chunk = bot.getChunkCache()[pos];
		console.log("Send from bot :: [" + data.x + "," + data.z + "]");
	});
});


console.log("Server started. Loading init stuff...");

var dontSendDebug = ["map_chunk", "playerlist_header", "scoreboard_objective", "world_particles", "entity_teleport"]

/*
var stdin = process.openStdin();
stdin.addListener("data", function(d) {
    // note:  d is an object, and when converted to a string it will
    // end with a linefeed.  so we (rather crudely) account for that  
    // with toString() and then trim() 
	let command = d.toString().trim()
    console.log(">> [" + command + "]");
	
});*/



console.log("Console chat OK");



function newBot(username) {
	bot =  mineflayer.createBot({
		host: "localhost",
		port: 25565,
		username: username,
		version: "1.12.2"
	});
	bot.ihavespawned = false;
	bot.on("spawn", function(){
		bot.ihavespawned = true;
	});
	bot._client.on("packet", function(data, meta){ //server >> client
		if(!(meta.state === states.PLAY && bot._client.state === states.PLAY)) return;
		if(meta.name =="login" || meta.name == "position") return;
		for(const client in server.clients) {
			filterPacketAndSend(data, meta, server.clients[client]);
		};
	});
}





function filterPacketAndSend(data, meta, dest) {
	if (meta.name !="keep_alive" && meta.name !="update_time") {
		dest.write(meta.name, data);
	}
}








console.log("---Hazır---");