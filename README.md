# OBN Tracker

## Run Ganache for development
### Prerequisite:
- Set the mnemonic phase: `salmon reopen news visual estate such shell struggle where attend educate express`


## Run Tracker
__Add environment variables:__
- NODE_ENV - default: 'development'
- DB_USERNAME - default: 'hungnvu'
- DB_DIALECT - default: 'postgres'
- DB_HOST - default: 'localhost'
- DB_PORT - default: 5432
- DB_NAME - default: 'obn'
- DB_LOGGING - default: 1
- DEBUG - default: 'obn-tracker:*'

# Database
## Create model
Command: `npm run sequelize model:generate -- --name User --attributes firstName:string,lastName:string,email:string`
