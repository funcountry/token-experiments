const pgp = require('pg-promise')();
import * as event_data from './helpers/event_data';

/*
 * Process:
 * 1. Get a log of all games and their host
 * 2. For each game check to see if it has record in player_grants of appropriate type
 * 3. If not, create a player holdem token grant
 */


const run = async() => {
    const db = await event_data.connect();

    await event_data.get_games(db).then((games:Array<event_data.Game>) => {
        games.forEach((game:event_data.Game) => {
            // event_data.get_host_holdem_grant(db, game.game_id).then(
            //     (grant:event_data.PlayerGrant) => {
            //         console.log("Found host grant for game", game.game_id);
            // }).catch((e:any) => {
            //     console.log("No host grant for game", game.game_id);
            //     event_data.create_host_holdem_grant(db, game, 1000);
            // });
        });
    });
};

run();
