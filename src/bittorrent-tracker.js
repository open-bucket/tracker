/**
 * Lib imports
 */
const TrackerServer = require('bittorrent-tracker').Server;
const BPromise = require('bluebird');

function startBitTorrentTrackerP(port) {
    const server = new TrackerServer({
        udp: false,
    });
    return BPromise.promisify(server.listen.bind(server))(port);
}

module.exports = {
    startBitTorrentTrackerP,
};
