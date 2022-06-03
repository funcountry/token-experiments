import * as pinata from './helpers/pinata';
import * as nft_helper from './helpers/nft-helper';
const config = require('../config.json');
import fs from 'fs';


console.log(pinata);


const run = async() => {
    const nftMapFile:string = config.nft_map;
    const nftCacheFile:string = config.nft_cache;
    const baseMetadataFile = config.base_metadata;
    const baseMetadata = JSON.parse(fs.readFileSync(baseMetadataFile).toString());
    console.log(baseMetadata.name);

    const nftm = new nft_helper.NftManager(
        require('../key.json'),
        config.solana_cluster,
        config.holdem_payer_address,
        nftCacheFile,
        nftMapFile,
        baseMetadata);
    console.log(nftm);

    await nftm.setup();

    nftm.mintNft("host_nft");
    // nft_helper.uploadNfts(nftMapFile, nftCacheFile, config.pinataJwt);

    // await pinata.pinataUpload(
    //     "./nfts/citizen_placements_v1/assets/0.gif",
    //     Buffer.from(JSON.stringify("{}")),
    //     config.pinataJwt,
    //     ""
    // );
};

run();
