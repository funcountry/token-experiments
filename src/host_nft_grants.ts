const pgp = require('pg-promise')();
import * as event_data from './helpers/event_data';
const config = require('../config.json');

/*
 * Process:
 * 1. Get a log of all games and their host
 * 2. For each game check to see if it has record in player_grants of appropriate type
 * 3. If not, create a player holdem token grant
 */


const run = async() => {
    const db = await event_data.connect(config.schema);

    const games:Array<event_data.Game> = await event_data.get_games(db);

    for(const game of games) {
        try {
            const grant:event_data.PlayerGrant = await event_data.get_one_game_grant(db, game.game_id, "host_nft_grant");
            console.log("Found host NFT grant for game", game.game_id);
        }
        catch(e) {
            console.log("No host NFT grant for game", game.game_id);
            event_data.create_host_nft_grant(db, game);
        }
    }
};

run();
