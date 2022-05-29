const pgp = require('pg-promise')();
import { Game, Player } from './helpers/event_data';


const run = async() => {

    db.any(`SELECT
      game_created.game_id AS game_id, 
      host_table.id AS host_id, 
      host_table.email as host_email,
      game_created.game_name as game_name,
      MAX(game_created.game_scheduled_at) AS game_scheduled_at, 
      MAX(game_created.game_created_at) AS game_created_at
    FROM 
      server_production.game_created game_created
      INNER JOIN server_production.game_request_handled request_handled
        ON request_handled.game_id = game_created.game_id and request_handled.game_request_kind = 'table.bet'
      left outer JOIN browser_production.users as host_table
        ON game_created.game_scheduled_by = host_table.id
    group by game_created.game_id, host_table.id, host_table.email, 
            game_created.game_name
    ORDER BY game_scheduled_at DESC;`).then((data:Array<Game>) => {
        data.forEach((game: Game) => {
            console.log(game.game_id, game.host_id, game.host_email);
        });
    });
};

run();
