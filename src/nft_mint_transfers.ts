const pgp = require('pg-promise')();
import * as event_data from './helpers/event_data';
import * as ht from './helpers/holdem_token';
const config = require('../config.json');
import * as nft_helper from './helpers/nft-helper';
import fs from 'fs';

/*
 * Process:
 * 1. Get a log of all games and their host
 * 2. For each game check to see if it has record in player_grants of appropriate type
 * 3. If not, create a player holdem token grant
 */

async function doGrants(grants:any, nftm:any, db:any) {
    console.log("Do grants");
    for(const grant of grants) {
        console.log(grant);
        if(grant.solana_wallet) {
            console.log("FOUND WALLET", grant.player_id);
            let nft_name = "";

            if(grant.grant_type == "host_nft_grant") {
                console.log("HOST NFT GRANT");
                nft_name = "host_nft";
            }
            else if(grant.grant_type == "player_nft_grant") {
                console.log("PLAYER NFT GRANT");
                nft_name = "player_nft";
            }

            if(nft_name) {
                console.log("MINTING NFT", nft_name);
                const mintedNft = await nftm.mintNft(nft_name);
                console.log("MINTED NFT", mintedNft.mint.publicKey.toString());

                await event_data.log_transaction(
                    db,
                    grant.grant_id,
                    'mint_nft',
                    mintedNft.mint.publicKey.toString(),
                    'success',
                    nft_name
                );

                let res = await nftm.transferNft(mintedNft, grant.solana_wallet);

                await event_data.log_transaction(
                    db,
                    grant.grant_id,
                    'transfer_nft',
                    res,
                    'success',
                    grant.solana_wallet
                );

                await event_data.complete_grant(db, grant.grant_id, grant.solana_wallet);
            }

            
            // console.log("Transfering", grant.amount, "to", grant.solana_wallet);

            // for(let i = 0; i < 3; i++) {
            //     try {
            //         console.log("Granting");
            //         await tm.grant(grant.solana_wallet, grant.amount);
            //     }
            //     catch(e) {
            //         console.log(e);
            //         console.log("Grant failed on try", i+1);
            //         continue;
            //     }

            //     console.log("Completing grant");
            //     await event_data.complete_grant(db, grant.grant_id, grant.solana_wallet);
            //     break;
            // }

            console.log("Updated");
        }
        else {
            console.log("NO WALLET", grant.player_id);
        }
    }
}

const run = async() => {
    const nftMapFile:string = config.nft_map;
    const nftCacheFile:string = config.nft_cache;
    const baseMetadataFile = config.base_metadata;
    const baseMetadata = JSON.parse(fs.readFileSync(baseMetadataFile).toString());
    const baseOffchainMetadataFile = config.base_offchain_metadata;
    const baseOffchainMetadata = JSON.parse(fs.readFileSync(baseOffchainMetadataFile).toString());
    const tm = new ht.HoldemTokenManager(require('../key.json'), config.solana_rpc_endpoint, config.holdem_token, config.holdem_payer_address);
    const db = await event_data.connect(config.schema);

    const nftm = new nft_helper.NftManager(
        config.pinataJwt,
        require('../key.json'),
        config.solana_cluster,
        config.holdem_payer_address,
        nftCacheFile,
        nftMapFile,
        baseMetadata,
        baseOffchainMetadata);
    await nftm.setup();
    await tm.setup();

    await doGrants(await event_data.get_grants(db, "new", "host_nft_grant"), nftm, db);
    await doGrants(await event_data.get_grants(db, "new", "player_nft_grant"), nftm, db);
};

run();
