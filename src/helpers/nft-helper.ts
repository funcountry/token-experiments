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
// const splToken = require('@solana/spl-token');
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
    console.log(nftMap);
    const nftCache = JSON.parse(fs.readFileSync(nftCacheFile).toString());
    console.log(nftCache);
    // console.log(nftMapFile);
    // const nftMap:object = require(nftMapFile);
    // console.log(nftMap);
    for(const key in nftMap) {
        const nftData = nftMap[key];
        const imagePath = nftData['image'];
        console.log(key);
        console.log(nftData);

        if(!(imagePath in nftCache)) {
            console.log("Needs upload", imagePath);

            const url = await pinata.pinataUpload(
                imagePath,
                jwt,
                ""
            );

            console.log("Uploaded to", url);
            nftCache[imagePath] = url;
        }
    }

    console.log(nftCache);
    await fs.writeFileSync(nftCacheFile, JSON.stringify(nftCache));
}

export async function getNftUri(filename:string) {
}

async function mintNft(kp: any, connection: any, metaplex:any, onchainMetadata:object) {
    // console.log(splToken.Token);
    // const mintAddress= await splToken.createMint(connection, kp, kp.publicKey, null, 0)
    // // console.log("Performing mint");
    // // console.log(mintAddress);
    // // console.log(mintAddress.toBase58());
    // // console.log(kp);
    // // console.log(connection);
    // const fromTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
    //     connection,
    //     kp,
    //     mintAddress,
    //     kp.publicKey);

    // console.log("From Token Account");
    // console.log(fromTokenAccount.address.toString());

    // // console.log(splToken.CreateMetadata);

    // let signature = await splToken.mintTo(connection, kp, mintAddress, fromTokenAccount.address, kp, 1);
    // console.log(signature);
    //
    // console.log(Metadata);
    // const metadata = await Metadata.getPDA(mintAddress);
    // console.log("Metadata", metadata);
    // console.log(metadata);
    // console.log(mplTokenMetadata);

    // onchainMetadata['creators'][0] = new mplTokenMetadata.Creator(onchainMetadata['creators'][0]);
    // console.log(mplTokenMetadata);
    // console.log(onchainMetadata);
    // const metadataData:DataV2 = onchainMetadata as DataV2;
    // console.log(metadataData);
    // console.log(metadataData.creators);
    // const md = mplTokenMetadata.Metadata.fromArgs({
    //     mint: mintAddress,
    //     data: metadataData
    // });
    // // console.log(md);
    // // console.log(md.mint);
    // // console.log(md.pretty());

    // let mdOutput = new solana.PublicKey();

    // const instr = mplTokenMetadata.createCreateMetadataAccountV2Instruction({
    //     metadata: mdOutput,
    //     mint: mintAddress.publicKey,
    //     mintAuthority: kp.publicKey,
    //     payer: kp.publicKey
    // }, { createMetadataAccountArgsV2: { isMutable: true, md } });


    // const createMetadatatx = new mplTokenMetadata.CreateMetadataAccountV2({ feePayer: kp.publicKey }, {
    //     metadata: null,
    //     metadataData: metadataData,
    //     updateAuthority: kp.publicKey,
    //     mintAuthority: kp.publicKey,
    //     mint: mintAddress
    // });
    // console.log("CreateMetadataV2");
    // console.log(createMetadatatx);

    // const createTxDetails = await solana.sendAndConfirmTransaction(
    //     connection, createMetadatatx, [kp]);
    // console.log(createTxDetails);

    // const toWallet = new solana.PublicKey(toAddress);

    // const toTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
    //     connection,
    //     kp,
    //     mint.address,
    //     toWallet);
    // console.log("To Token Account");
    // console.log(toTokenAccount.address.toString());

    // const res = await splToken.transfer(
    //     connection,
    //     kp,
    //     fromTokenAccount.address,
    //     toTokenAccount.address,
    //     kp,
    //     amount
    // );
    // console.log(res);
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
        network:string,
        payer_address:string,
        nftCacheFile:string,
        nftMapFile:string,
        _baseMetadata:object,
        _baseOffchainMetadata:object) {
        this.jwt = jwt;
        this.kp = load_key(key);
        this.connection = new solana.Connection(
            solana.clusterApiUrl(network),
            'confirmed'
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
    public async mintNft(nftIdentifier:string) {
        console.log("Minting", nftIdentifier);

        const imageUri = this.nftCache[this.nftMap[nftIdentifier]['image']];

        const offchainMetadataFile:string = this.nftMap[nftIdentifier]['metadata'];
        const offChainMetadata  = JSON.parse(fs.readFileSync(offchainMetadataFile).toString());

        const combinedOffchainMetadata:object = JSON.parse(JSON.stringify(this.baseOffchainMetadata));
        Object.assign(combinedOffchainMetadata, offChainMetadata);
        console.log("Off chain metadata", combinedOffchainMetadata);

        const combinedMetadata:object = JSON.parse(JSON.stringify(this.baseMetadata));
        Object.assign(combinedMetadata, offChainMetadata);
        console.log("On Chain metadata", combinedMetadata);


        // Render off chain metdata
        const renderedOffchain:any = await Eta.render(JSON.stringify(combinedOffchainMetadata), {
            image_uri: imageUri
        }, {
            'varName': 't'
        });
        console.log("Offchain data");
        console.log(renderedOffchain);

        // Upload off chain metadata
        fs.writeFileSync('tempJson.json', renderedOffchain);

        const offchainUrl = await pinata.pinataUpload(
            'tempJson.json',
            this.jwt,
            ""
        );

        console.log("Uploaded offchain metadata to", offchainUrl);

        //// Render onchain metdata
        const renderedMetadata:any = await Eta.render(JSON.stringify(combinedMetadata), {
            offchain_metadata_uri: offchainUrl
        }, {
            'varName': 't'
        });
        console.log(renderedMetadata);

        const md:DataV2 = JSON.parse(renderedMetadata);
        console.log(md);

        const mintedNft = await this.metaplex.nfts().create({
            uri: offchainUrl,
            'name': md.name,
            'symbol': md.symbol
        });
        console.log(mintedNft);

        const tokenAddress = mintedNft.mint.publicKey.toString();
        console.log(tokenAddress);
        
        // Now to transfer it to recipient
    }



    // public async grant(toAddress:string, amount:number) {
    //     console.log(this.mint);
    //     console.log("Granting", amount, "tokens to", toAddress);

    //     await transfer(this.mint, this.kp, toAddress,
    //         this.connection, amount);
    // }
}
