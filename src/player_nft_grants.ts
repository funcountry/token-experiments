const pgp = require('pg-promise')();
import * as event_data from './helpers/event_data';
const config = require('../config.json');


const run = async() => {
    const db = await event_data.connect(config.schema);

    const games:Array<event_data.Game> = await event_data.get_games(db);
    console.log(games);


    for(const game of games) {
        const players:Array<event_data.Player> = await event_data.get_game_players(db, game.game_id);
        console.log(players);
        for(const player of players) {

            try {
                const grant:event_data.PlayerGrant = await event_data.get_player_nft_grant(db, game.game_id, player.player_id);
                console.log(grant);
            }
            catch(e) {
                //TODO: AE _ Yeah, I know this is a bad way to do this.
                console.log("Creating nft grant for player", player);
                await event_data.create_player_nft_grant(db, game, player);
            }
        }
    };
};

run();
