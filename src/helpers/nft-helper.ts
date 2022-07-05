import * as pinata from './pinata';
import fs from 'fs';
import * as Eta from 'eta';

import {
  DataV2,
} from '@metaplex-foundation/mpl-token-metadata';
// import * as mplTokenMetadata from  '/Users/aelaguiz/workspace/metaplex-program-library/token-metadata/js/src/mpl-token-metadata';
// import { 
//     DataV2,
//     CreateMetadataV2
// }  from  '/Users/aelaguiz/workspace/metaplex-program-library/token-metadata/js/src/mpl-token-metadata';

const solana = require('@solana/web3.js');
// const mplTokenMetadata = require("@metaplex-foundation/mpl-token-metadata");
// const metaplex = require('@metaplex/js');
// const anchor = require("@project-serum/anchor");
import { 
    Metaplex,
    keypairIdentity
} from "@metaplex-foundation/js-next";


function load_key(key:any) {
    return solana.Keypair.fromSecretKey(Buffer.from(key));
}


export async function uploadNfts(nftMapFile:string, nftCacheFile:string, jwt:string) {
    const nftMap = JSON.parse(fs.readFileSync(nftMapFile).toString());
    // console.log(nftMap);
    const nftCache = JSON.parse(fs.readFileSync(nftCacheFile).toString());
    // console.log(nftCache);
    // console.log(nftMapFile);
    // const nftMap:object = require(nftMapFile);
    // console.log(nftMap);
    for(const key in nftMap) {
        const nftData = nftMap[key];

        for(const uploadKey of ['image', 'animation']) {
            const imagePath = nftData[uploadKey];
            if(!imagePath) {
                console.log("No image of type", uploadKey);
                continue;
            }
            console.log(key);
            console.log(nftData);

            if(!(imagePath in nftCache)) {
                console.log("Needs upload", imagePath);

                const url = await pinata.pinataUpload(
                    imagePath,
                    jwt,
                    ""
                );

                if(!url) {
                    throw new Error("UPLOAD FAILED");
                }

                console.log("Uploaded to", url);
                nftCache[imagePath] = url;
            }
        }
    }

    // console.log(nftCache);
    await fs.writeFileSync(nftCacheFile, JSON.stringify(nftCache));
}

export type NFT = {
    mint: any;
}


export class NftManager {
    jwt: any;
    kp: any;
    connection: any;
    payer_address: any;
    wallet: any;
    nftMap: any;
    nftCache: any;
    baseMetadata: any;
    baseOffchainMetadata: any;
    metaplex: any;


    constructor(
        jwt: Object,
        key:Object,
        endpoint:string,
        payer_address:string,
        nftCacheFile:string,
        nftMapFile:string,
        _baseMetadata:object,
        _baseOffchainMetadata:object) {
        this.jwt = jwt;
        this.kp = load_key(key);
        // console.log("Making solana connection", endpoint);
        this.connection = new solana.Connection(
            endpoint,
            'finalized'
        );
        this.metaplex = new Metaplex(this.connection);

        // this.wallet = new anchor.Wallet(this.kp);

        this.nftMap = JSON.parse(fs.readFileSync(nftMapFile).toString());
        this.nftCache = JSON.parse(fs.readFileSync(nftCacheFile).toString());

        this.baseMetadata = _baseMetadata;
        this.baseOffchainMetadata = _baseOffchainMetadata;
    }

    public async setup() {
        console.log("Initializing NFT manager");
        this.metaplex.use(keypairIdentity(this.kp));
    }

    /*
     * Sources of metadata and the order in which they are applied:
     * Base - Every single NFT starts with this
     * NFT - Each FNT can extend the base with its own custom attributes
     * Instance - Specific to this instantiation of that NFT
     *  Host's name
     *  Date of tournament
     */
    public async mintNftTo(nftIdentifier:string, toAddress:string) {
        // console.log("Minting", nftIdentifier);

        const imageUri = this.nftCache[this.nftMap[nftIdentifier]['image']];
        const animationUri = this.nftCache[this.nftMap[nftIdentifier]['animation']];
        // console.log(this.nftCache);
        // console.log(animationUri);

        const offchainMetadataFile:string = this.nftMap[nftIdentifier]['metadata'];
        const offChainMetadata  = JSON.parse(fs.readFileSync(offchainMetadataFile).toString());

        const combinedOffchainMetadata:object = JSON.parse(JSON.stringify(this.baseOffchainMetadata));
        Object.assign(combinedOffchainMetadata, offChainMetadata);
        // console.log("Off chain metadata", combinedOffchainMetadata);

        const combinedMetadata:object = JSON.parse(JSON.stringify(this.baseMetadata));
        Object.assign(combinedMetadata, offChainMetadata);
        // console.log("On Chain metadata", combinedMetadata);


        // Render off chain metdata
        const renderedOffchain:any = await Eta.render(JSON.stringify(combinedOffchainMetadata), {
            image_uri: imageUri,
            animation_uri: animationUri
        }, {
            'varName': 't'
        });
        // console.log("Offchain data");
        // console.log(renderedOffchain);

        // Upload off chain metadata
        fs.writeFileSync('tempJson.json', renderedOffchain);

        const offchainUrl = await pinata.pinataUpload(
            'tempJson.json',
            this.jwt,
            ""
        );
        if(offchainUrl === undefined) {
            throw new Error("Failed to upload metadata");
        }

        // console.log("Uploaded offchain metadata to", offchainUrl);

        //// Render onchain metdata
        const renderedMetadata:any = await Eta.render(JSON.stringify(combinedMetadata), {
            offchain_metadata_uri: offchainUrl,
            image_uri: imageUri,
            animation_uri: animationUri
        }, {
            'varName': 't'
        });

        const md:DataV2 = JSON.parse(renderedMetadata);

        const destPublicKey = new solana.PublicKey(toAddress);

        const mintedNft = await this.metaplex.nfts().create({
            uri: offchainUrl,
            isMutable: true,
            name: md.name,
            symbol: md.symbol,
            payer: this.kp,
            mintAuthority: this.kp,
            freezeAuthority: this.kp.publicKey,
            owner: destPublicKey
        });

        console.log("Mint", mintedNft.mint.publicKey.toString());
        console.log("Associated Token", mintedNft.associatedToken.toString());
        console.log("Master edition", mintedNft.masterEdition.toString());
        console.log("Mint on nft", mintedNft.nft.mint.toString());

        return mintedNft;
    }
}
