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
    const db = await event_data.connect();

    await tm.setup();
    const grants:Array<event_data.PlayerGrant>
        = await event_data.get_new_player_holdem_grants(db);
    for(const grant of grants) {
        // console.log(grant);
        if(grant.solana_wallet) {
            console.log("Has wallet");
        }
        else {
            console.log("NO WALLET");
        }
    }
    // tm.grant("6eC4TmiBUHUoEANpBqogcFsrCKM7dEafxQofiQjinZdA", 1000);
    // await event_data.get_games(db).then((games:Array<event_data.Game>) => {
    //     games.forEach((game:event_data.Game) => {
    //         event_data.get_host_holdem_grant(db, game.game_id).then(
    //             (grant:event_data.PlayerGrant) => {
    //                 if(grant.grant_status == "new") {
    //                     console.log("NEW Found host grant for game", game.game_id, game.host_id);

    //                     // await ht.grant(kp, 
    //                     // tm.grant(l
    //                     if(grant.solana_wallet) {
    //                         console.log("Has wallet");
    //                         tm.grant(grant.solana_wallet, grant.amount).then(() => {
    //                             console.log("GRANTED");
    //                             event_data.complete_host_holdem_grant(db, grant.grant_id).then(() => {
    //                                 console.log("Updated");
    //                             });
    //                         });
    //                     }
    //                     else {
    //                         // console.log("NO WALLET");
    //                     }

    //                 }
    //         }).catch((e:any) => {
    //             console.log("No host grant for game", game.game_id);
    //         });
    //     });
    // });
};

run();
