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

    const games:Array<event_data.Game> = await event_data.get_games(db);
    console.log(games);


    for(const game of games) {
        const players:Array<event_data.Player> = await event_data.get_game_players(db, game.game_id);
        // console.log(players);
        for(const player of players) {

            try {
                const grant:event_data.PlayerGrant = await event_data.get_player_holdem_grant(db, game.game_id, player.player_id);
            }
            catch(e) {
                console.log("Creating grant for player", player);
                await event_data.create_player_holdem_grant(db, game, player, 500);
            }
        }
    };
};

run();
