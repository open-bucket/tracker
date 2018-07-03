const TrackerServer = require('bittorrent-tracker').Server; 
const BPromise = require('bluebird');

const server = new TrackerServer({ 
    http: false, 
    udp: false, 
    ws: false 
}); 

function startTorrentTrackerP(port) { 

    return BPromise.promisify(server.listen.bind(server))(port); 
}

module.exports={
    startTorrentTrackerP,
    server
}
