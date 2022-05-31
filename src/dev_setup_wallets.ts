const pgp = require('pg-promise')();
import * as event_data from './helpers/event_data';
const config = require('../config.json');

/*
 * Populates solana wallet addresess for dev environment
 */

const run = async() => {
    const db = await event_data.connect(config.schema);

    const wallets = require('../dev_wallets.json');

    await event_data.dev_setup_wallets(db, wallets);
};

run();
