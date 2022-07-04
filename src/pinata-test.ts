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
        config.solana_rpc_endpoint,
        config.holdem_payer_address,
        nftCacheFile,
        nftMapFile,
        baseMetadata,
        baseOffchainMetadata);
    // console.log(nftm);

    await nftm.setup();

    const mintedNft = await nftm.mintNftTo("host_nft", "sjZcLR8dVxz1VxJtBAVWSLWot4eVEF3m84UPKJvobRE");
    console.log(mintedNft.mint.publicKey.toString());
    // await nftm.transferNft(mintedNft, "sjZcLR8dVxz1VxJtBAVWSLWot4eVEF3m84UPKJvobRE");

    // const foundNft = await nftm.loadNft(mintedNft.mint.publicKey.toString());
    // console.log(mintedNft);
    // console.log(foundNft);
    // const foundNft = await nftm.loadNft("8ofCjk7ccEv2SgFPJ4NcX7tW59spim3RQYbTUs4YHqzq");
    // console.log(foundNft);
    // console.log(foundNft.mint);
    // console.log("MINTING TO");
    // await nftm.transferNft(foundNft, "sjZcLR8dVxz1VxJtBAVWSLWot4eVEF3m84UPKJvobRE");
    // await nftm.transferNft(foundNft, "D5cBGFoUewTo4yW5AWti6creqxUKGMJCNFn8za3YwJb5");

    // const mintedNft2 = await nftm.mintNft("player_nft");
    // console.log(mintedNft2.mint.publicKey.toString());

    // await pinata.pinataUpload(
    //     "./nfts/citizen_placements_v1/assets/0.gif",
    //     Buffer.from(JSON.stringify("{}")),
    //     config.pinataJwt,
    //     ""
    // );
};

run();

// Minted test 6 2 8:00pm
//2iAo8YdQ8D3ma7L3Mmm5qzjbGZBoDhh1xHofZYpVZdbE
//
//8:36pm
//FbBzCdJsQoAk7z71RfkdryMdg6kmYihoGaaE6tDuzJDA
//
//9:46pm
//9SVaCLapjbXkVw8FatyjG5iekcwYkGVHahHUuikUZtMo
//
