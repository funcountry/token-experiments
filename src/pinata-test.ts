import * as pinata from './helpers/pinata';
import * as nft_helper from './helpers/nft-helper';
const config = require('../config.json');
import fs from 'fs';

console.log(pinata);

// const nftMapFile:string = config.nft_map;
// const nftCacheFile:string = config.nft_cache;

const run = async() => {
    const baseMetadataFile = config.base_metadata;
    const baseMetadata = JSON.parse(fs.readFileSync(baseMetadataFile).toString());
    console.log(baseMetadata.name);
    // nft_helper.uploadNfts(nftMapFile, nftCacheFile, config.pinataJwt);

    // await pinata.pinataUpload(
    //     "./nfts/citizen_placements_v1/assets/0.gif",
    //     Buffer.from(JSON.stringify("{}")),
    //     config.pinataJwt,
    //     ""
    // );
};

run();
