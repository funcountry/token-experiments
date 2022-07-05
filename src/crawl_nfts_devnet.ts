import * as pinata from './helpers/pinata';
import * as nft_helper from './helpers/nft-helper';
const config = require('../config.json');
import fs from 'fs';
import * as event_data from './helpers/event_data';

const solana = require('@solana/web3.js');


console.log(pinata);
console.log(process.cwd());


const run = async() => {
    const nftMapFile:string = config.nft_map;
    const nftCacheFile:string = config.nft_cache;
    const baseMetadataFile = config.base_metadata;
    const baseMetadata = JSON.parse(fs.readFileSync(baseMetadataFile).toString());
    const baseOffchainMetadataFile = config.base_offchain_metadata;
    const baseOffchainMetadata = JSON.parse(fs.readFileSync(baseOffchainMetadataFile).toString());
    // console.log(baseMetadata.name);
    //
    const db = await event_data.connect(config.schema);
    const devNetConnection = new solana.Connection(solana.clusterApiUrl('devnet'), 'confirmed');

    const res = await db.any(`
        SELECT 
            pg.id as grant_id,
            lg.blockchain_transaction,
            lg.transaction_type,
            lg.account_optional
        FROM scratch_production.player_grants pg
            JOIN scratch_production.transaction_log lg
            ON pg.id=lg.grant_id
        WHERE lg.transaction_type IN ('mint_nft', 'transfer_nft') AND pg.grant_status !='retry' AND lg.result='success'
        ORDER BY pg.record_created_ts DESC
        `);

    for(const row of res) {
        // console.log(row);

        if(row.transaction_type == "transfer_nft") {
            let t = await devNetConnection.getTransaction(row.blockchain_transaction);
            if(t) {
                console.log(row.grant_id, row.blockchain_transaction, "is a DEVNET transaction");
                let r = await db.none("UPDATE scratch_production.player_grants SET grant_status='retry' WHERE id=$1", row.grant_id);
                await db.none("UPDATE scratch_production.transaction_log SET result='devnet_retry' WHERE grant_id=$1", row.grant_id);
                // console.log(r);
            }
            // else {
            //     console.log(row.blockchain_transaction, "is NOT a devnet transaction");
            // }
        }
        else if(row.transaction_type == "mint_nft") {
            let a = await devNetConnection.getAccountInfo(new solana.PublicKey(row.blockchain_transaction));
            if(a) {
                console.log(row.grant_id, row.blockchain_transaction, "is a DEVNET account");
                let r = await db.none("UPDATE scratch_production.player_grants SET grant_status='retry' WHERE id=$1", row.grant_id);
                await db.none("UPDATE scratch_production.transaction_log SET result='devnet_retry' WHERE grant_id=$1", row.grant_id);
                // console.log(r);
            }
            // else {
            //     console.log(row.blockchain_transaction, "is NOT a devnet account");
            // }
        }
        // console.log(row.blockchain_transaction, t);
    }
    // let r = await devNetConnection.getTransaction('2fRZstL92ZC3HrnSZTpBpEyDLguPWKTS6DJkng6QxBDFPp4C8yEv3yvCuwUK46MqbQAaVf6qF73hu2vcAdwZfonf');
    // console.log(r);
    // console.log(txn);
};

run();
