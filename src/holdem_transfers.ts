const pgp = require('pg-promise')();
import * as event_data from './helpers/event_data';
import * as ht from './helpers/holdem_token';
const config = require('../config.json');

/*
 * Process:
 * 1. Get a log of all games and their host
 * 2. For each game check to see if it has record in player_grants of appropriate type
 * 3. If not, create a player holdem token grant
 */


const run = async() => {
    const tm = new ht.HoldemTokenManager(require('../key.json'), config.solana_cluster, config.holdem_token, config.holdem_payer_address);
    const db = await event_data.connect(config.schema);

    await tm.setup();
    const grants:Array<event_data.PlayerGrant>
        = await event_data.get_new_holdem_grants(db);
    for(const grant of grants) {
        // console.log(grant);
        if(grant.solana_wallet) {
            console.log("Has wallet");
            
            console.log("Transfering", grant.amount, "to", grant.solana_wallet);

            await tm.grant(grant.solana_wallet, grant.amount);
            // await event_data.complete_grant(db, grant.grant_id, grant.solana_wallet);

            console.log("Updated");
        }
        else {
            console.log("NO WALLET");
        }
    }
};

run();
