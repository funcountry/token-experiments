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
    const tm = new ht.HoldemTokenManager(require('../key.json'), config.solana_rpc_endpoint, config.holdem_token, config.holdem_payer_address);
    const db = await event_data.connect(config.schema);

    await tm.setup();
    const grants:Array<event_data.PlayerGrant>
        = await event_data.get_new_holdem_grants(db);
    for(const grant of grants) {
        // console.log(grant);
        if(grant.solana_wallet) {
            console.log("FOUND WALLET", grant.player_id);
            
            console.log("Transfering", grant.amount, "to", grant.solana_wallet);

            for(let i = 0; i < 3; i++) {
                try {
                    console.log("Granting");
                    await tm.grant(grant.solana_wallet, grant.amount);
                }
                catch(e) {
                    console.log(e);
                    console.log("Grant failed on try", i+1);
                    continue;
                }

                console.log("Completing grant");
                await event_data.complete_grant(db, grant.grant_id, grant.solana_wallet);
                break;
            }

            console.log("Updated");
        }
        else {
            console.log("NO WALLET", grant.player_id);
        }
    }
};

run();
