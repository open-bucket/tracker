/**
 * Project imports
 */
const CM = require('./consumer-manager');
const PM = require('./producer-manager');
const {createDebugLogger} = require('../utils');
const {createFileAndShardP} = require('../services/file');
const {WS_ACTIONS} = require('../enums');

// eslint-disable-next-line no-unused-vars
const log = createDebugLogger('ws:consumer');

async function handleUploadFile(payload) {
    const file = await createFileAndShardP(payload);
    log('A new file has been added to DB:', file.name);
    for (let {name, magnetURI, size} of file.shards) {
        const message = {
            action: WS_ACTIONS.PRODUCER_SHARD_ORDER,
            payload: {name, magnetURI, size}
        };
        PM.broadcast(JSON.stringify(message));
    }
}

function handleConsumerMessage(model) {
    return (rawMessage) => {
        const {action, payload} = JSON.parse(rawMessage);

        if (action === WS_ACTIONS.CONSUMER_UPLOAD_FILE) {
            /*
                TODO: more action here:

                Gui PRODUCER_STORE_REQUEST action toi nhieu producer (tat ca?), tinh so luong producer da confirm order

                Nhu 1 tro choi, ai download nhanh truoc thi se dc luu. Khi Producer tat thi se xoa het file (ca trong DB).
                Khi producer download xong, no se tinh hash cua file roi gui toi Tracker:
                {action: WS_ACTIONS.PRODUCER_SHARD_SERVED, payload: {name: 'abc.part-0', hash: 'asdaqwdqw'}}
                Khi Tracker nhan dc, Tracker se check hash, neu hash dung, luu trong DB.
                Khi du so luong availability, Tracker dung request file

                Nice point: 1GB served = 1 point. 1 hour = 1 point
                current strategy: the first to only will have the seat
                For each producer in connectedProducer
                    If producer.availabilitySpace < shard.size
                        continue
                    else
                        producer.ws.send({
                            action: WS_ACTIONS.PRODUCER_SHARD_ORDER,
                            payload: {name: 'abc.part-0', magnetURI: 'magnet:x:uri:123sadq'}
                        })



                        producer.availableSpace -= shard.size
                            => not do it here yet, Producer must confirm it has download the shard
                 */
            handleUploadFile(payload)
                .then(() => log('Producer has been notified, waiting for their response..'))
                .catch((error) => log('Error while notifying producers', error));
        }
        return model;
    };
}

function handleConsumerClose(id) {
    return () => {
        // TODO: consumer ws handle upload file
        // when it is closed while file's availability is not enough, delete the file.
        log('Consumer disconnected:', id);
        CM.remove(id);
        log('Current connected consumers:', CM.connectedConsumers);
        return id;
    };
}

module.exports = {
    handleConsumerMessage,
    handleConsumerClose
};
