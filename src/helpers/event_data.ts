const pgp = require('pg-promise')();
const uuid = require('uuid');

const schema:string = "scratch_production";

export type Game = {
    'game_id': string,
    'host_id': string,
    'host_email': string,
    'game_name': string,
    'game_scheduled_at': string,
    'game_created_at': string
};

export type PlayerGrant = {
    'grant_id': string,
    'player_id': string,
    'game_id': string,
    'grant_status': string,
    'grant_type': string,
    'solana_wallet': string,
    'amount': number
};

export type Player = {
    'player_id': string
};


export async function connect() {
    return pgp({
        host: 'stats-production.c6azlopsua2y.us-east-2.redshift.amazonaws.com',
        port: 5439,
        database: 'stats',
        user: 'amir',
        password: 'SkMRC2QQffPGj7PFQLWHqGZuVCvFcgeB',
        max: 30 // use up to 30 connections

        // "types" - in case you want to set custom type parsers on the pool level
    });
}


export async function get_games(db:any) {
    const data:Array<Game> = await db.any(`SELECT
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
    ORDER BY game_scheduled_at DESC;`);

    return data;
}

export async function get_game_players(db: any, game_id:string ) {
    const data:Array<Player> = await db.any(`SELECT 
        rh.user_id as player_id,
        COUNT(DISTINCT rh.id)
     FROM server_production.game_request_handled rh
     WHERE 
        rh.game_id=$1
        AND rh.game_request_kind=\'table.bet\' GROUP BY rh.user_id;`, [game_id]);

    return data;
}

export async function get_host_holdem_grant(db:any, game_id:string) {
    const grant:PlayerGrant = await db.one(`SELECT
        grants.id as grant_id,
        grants.game_id as game_id,
        grants.player_id as player_id,
        grants.grant_type as grant_type,
        grants.grant_status as grant_status,
        grants.solana_wallet as solana_wallet,
        grants.amount as amount
     FROM
        ` + schema + `.player_grants as grants
     WHERE
        grants.game_id = $1
        AND grants.grant_type = \'host_holdem_grant\';`, game_id);

    return grant;
}

export async function get_player_holdem_grant(db:any, game_id:string, player_id:string) {
    const grant:PlayerGrant = await db.one(`SELECT
        grants.id as grant_id,
        grants.game_id as game_id,
        grants.player_id as player_id,
        grants.grant_type as grant_type,
        grants.grant_status as grant_status,
        grants.solana_wallet as solana_wallet,
        grants.amount as amount
     FROM
        ` + schema + `.player_grants as grants
     WHERE
        grants.game_id = $1
        AND grants.player_id=$2
        AND grants.grant_type = \'player_holdem_grant\';`, [game_id, player_id]);

    return grant;
}

export async function get_new_player_holdem_grants(db:any) {
    return await db.any(`SELECT
        grants.id as grant_id,
        grants.game_id as game_id,
        grants.player_id as player_id,
        grants.grant_type as grant_type,
        grants.grant_status as grant_status,
        grants.solana_wallet as solana_wallet,
        grants.amount as amount
     FROM
        ` + schema + `.player_grants as grants
     WHERE
        grants.grant_status=\'new\'
        AND grants.grant_type = \'player_holdem_grant\';`);
}

export async function create_host_holdem_grant(db:any, game:Game, amount:number) {
    const grant_id:string = uuid.v4();
    await db.none(`
        INSERT INTO ` + schema + `.player_grants(id, game_id, player_id, grant_type, grant_status, amount) VALUES (
            $1, $2, $3, \'host_holdem_grant\', \'new\', $4);`, [grant_id, game.game_id, game.host_id, amount]);
}

export async function create_player_holdem_grant(db:any, game:Game, player:Player, amount:number) {
    const grant_id:string = uuid.v4();
    await db.none(`
        INSERT INTO ` + schema + `.player_grants(id, game_id, player_id, grant_type, grant_status, amount) VALUES (
            $1, $2, $3, \'player_holdem_grant\', \'new\', $4);`, [grant_id, game.game_id, player.player_id, amount]);
}

export async function complete_host_holdem_grant(db:any, grant_id:string) {
    await db.none(`
        UPDATE ` + schema + `.player_grants as grants SET
            record_updated_ts = CURRENT_TIMESTAMP, grant_status='transfered'
        WHERE
            grants.id = $1`, grant_id)
}
