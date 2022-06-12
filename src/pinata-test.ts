import * as pinata from './helpers/pinata';
import * as nft_helper from './helpers/nft-helper';
const config = require('../config.json');
import fs from 'fs';


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
    await nft_helper.uploadNfts(nftMapFile, nftCacheFile, config.pinataJwt);

    const nftm = new nft_helper.NftManager(
        config.pinataJwt,
        require('../key.json'),
        config.solana_cluster,
        config.holdem_payer_address,
        nftCacheFile,
        nftMapFile,
        baseMetadata,
        baseOffchainMetadata);
    // console.log(nftm);

    await nftm.setup();

    const mintedNft = await nftm.mintNft("host_nft");
    console.log(mintedNft.mint.publicKey.toString());
    const mintedNft2 = await nftm.mintNft("player_nft");
    console.log(mintedNft2.mint.publicKey.toString());

    // await pinata.pinataUpload(
    //     "./nfts/citizen_placements_v1/assets/0.gif",
    //     Buffer.from(JSON.stringify("{}")),
    //     config.pinataJwt,
    //     ""
    // );
};

run();
