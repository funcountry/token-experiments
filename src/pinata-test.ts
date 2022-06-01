import * as pinata from './helpers/pinata';
import * as nft_helper from './helpers/nft-helper';
const config = require('../config.json');

console.log(pinata);

const nftMapFile:string = config.nft_map;
const nftCacheFile:string = config.nft_cache;

const run = async() => {
    nft_helper.uploadNfts(nftMapFile, nftCacheFile, config.pinataJwt);

    // await pinata.pinataUpload(
    //     "./nfts/citizen_placements_v1/assets/0.gif",
    //     Buffer.from(JSON.stringify("{}")),
    //     config.pinataJwt,
    //     ""
    // );
};

run();
