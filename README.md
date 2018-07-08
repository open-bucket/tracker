# OBN Tracker
Open Bucket Tracker

For more information about the Open Bucket network, refer to: https://github.com/open-bucket/blueprint

## Production
This project's just for demo purpose & not suitable for production. But PRs are welcome.

## Development
- Refer to https://github.com/open-bucket/dev for more information

## Run Tracker on Docker
### Available environment variables:
- NODE_ENV - default: `development`
- OBN_TRACKER_HTTP_PORT - default: `3000`
- OBN_TRACKER_WS_PORT - default: `4000`
- OBN_BITTORRENT_TRACKER_HTTP_PORT - default: `3001`
- OBN_DB_USERNAME - default: `hungnvu`
- OBN_DB_PASSWORD - default: `null`
- OBN_DB_HOST - default: `localhost`
- OBN_DB_PORT - default: `5432`
- OBN_DB_NAME - default: `obn`
- OBN_DB_LOGGING - default: `false`
- OBN_JWT_SECRET - default: `shhhh`
- OBN_ETHEREUM_NODE_URL - default: `http://127.0.0.1:7545`
- OBN_TRACKER_ADDRESS - default:  `0x143Ade676D33F648Beb5097F6f3606b45249c34c`
- OBN_CONSUMER_ACTIVATOR_MIN_AMOUNT - default: `1000000000000` (1 finney)
- OBN_PRODUCER_ACTIVATOR_ACTIVATION_FEE - default: `1000000000000` (1 finney)
- OBN_GAS_PRICE - default: `2000000000` (2 Gwei)
- OBN_GAS_LIMIT - default: `4712388`

### Build Docker image
- Sample command:
    ```bash
    docker build -t obn-tracker .
    ```

### Run Docker container
- Sample command:
    ```bash
    docker run -e OBN_TRACKER_HTTP_PORT=5000 obn-tracker
    ```
