const pgp = require('pg-promise')();
import * as event_data from './helpers/event_data';
const config = require('../config.json');

/*
 * Process:
 * 1. Get a log of all games and their host
 * 2. For each game check to see if it has record in player_grants of appropriate type
 * 3. If not, create a player holdem token grant
 */

async function doHands(db:any, games:any)  {
    console.log("HAND GRANTS");

    // get all game player entries that haven't been checked
    const uncheckedHands:event_data.UncheckedHand[] = await event_data.get_unchecked_hands_grants(db, 'aces');
    console.log(uncheckedHands);
}

async function doHosts(db:any, games:any)  {
    for(const game of games) {
        try {
            const grant:event_data.PlayerGrant = await event_data.get_host_holdem_grant(db, game.game_id);
            console.log("Found host grant for game", game.game_id);
        }
        catch(e) {
            console.log("No host grant for game", game.game_id);
            event_data.create_host_holdem_grant(db, game, 1000000000000);
        }

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

async function doPlayers(db:any, games:any)  {
    for(const game of games) {
        const players:Array<event_data.Player> = await event_data.get_game_players(db, game.game_id);
        for(const player of players) {
            try {
                const grant:event_data.PlayerGrant = await event_data.get_player_holdem_grant(db, game.game_id, player.player_id);
                console.log("Found player token grant for", player, game);
            }
            catch(e) {
                //TODO: AE _ Yeah, I know this is a bad way to do this.
                console.log("Creating grant for player", player);
                await event_data.create_player_holdem_grant(db, game, player, 500000000000);
            }

            try {
                const grant:event_data.PlayerGrant = await event_data.get_player_nft_grant(db, game.game_id, player.player_id);
                console.log("Found player nft grant for", player, game);
                // console.log(grant);
            }
            catch(e) {
                //TODO: AE _ Yeah, I know this is a bad way to do this.
                console.log("Creating nft grant for player", player);
                await event_data.create_player_nft_grant(db, game, player);
            }
        }
    }
};

async function doPlacements(db:any, games:any)  {
    const completedGames = await event_data.get_sng_game_completeds(db);
    // for(const game of games) {
    for(const completedGame of completedGames) {
        try {
            const grants:Array<event_data.PlayerGrant> = await event_data.get_player_placement_grants(db, completedGame.game_id, completedGame.player_id);

            if(grants.length > 0) {
                // console.log("Found placement grant for ", completedGame.game_id, completedGame.player_id, completedGame.rank);
            }
            else {
                // console.log("No placement grant for ", completedGame.game_id, completedGame.player_id, completedGame.rank);
                if(completedGame.rank == 1) {
                    event_data.create_generic_player_nft_grant(db, completedGame.game_id, completedGame.player_id, 'player_placement_grant', JSON.stringify({'rank': 1}));
                }
                else if(completedGame.rank == 2 && completedGame.game_player_count > 2) {
                    event_data.create_generic_player_nft_grant(db, completedGame.game_id, completedGame.player_id, 'player_placement_grant', JSON.stringify({'rank': 2}));
                }
                else if(completedGame.rank == 3 && completedGame.game_player_count > 3) {
                    event_data.create_generic_player_nft_grant(db, completedGame.game_id, completedGame.player_id, 'player_placement_grant', JSON.stringify({'rank': 3}));
                }
                else if(completedGame.rank == completedGame.game_player_count && completedGame.game_player_count >=3) {
                    console.log("FIRST OUT",completedGame);
                    event_data.create_generic_player_nft_grant(db, completedGame.game_id, completedGame.player_id, 'first_out_grant', '');

                }
            }
        }
        catch(e) {
            console.log(e);
        }
    }
};

const run = async() => {
    const db = await event_data.connect(config.schema);

    await event_data.pull_wallets(db);

    const games:Array<event_data.Game> = await event_data.get_games(db);

    await doHands(db, games);
    await doHosts(db, games);
    await doPlayers(db, games);
    await doPlacements(db, games);
};

run();
