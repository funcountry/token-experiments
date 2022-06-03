import * as pinata from './pinata';
import fs from 'fs';
import * as Eta from 'eta';

const solana = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const mplTokenMetadata = require("@metaplex-foundation/mpl-token-metadata");
const metaplex = require('@metaplex/js');
const anchor = require("@project-serum/anchor");

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

async function mintNft(mintAddress:any, kp: any, connection: any) {
    console.log("Performing mint");
    console.log(mintAddress);
    console.log(kp);
    console.log(connection);
    const fromTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
        connection,
        kp,
        mintAddress,
        kp.publicKey);

    console.log("From Token Account");
    console.log(fromTokenAccount.address.toString());

    let signature = await splToken.mintTo(connection, kp, mintAddress, fromTokenAccount.address, kp, 1);
    console.log(signature);

    const metadata = await mplTokenMetadata.Metadata.getPDA(mintAddress);
    console.log("Metadata");
    console.log(metadata);

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
    kp: any;
    connection: any;
    mintAddress: any;
    payer_address: any;
    wallet: any;
    nftMap: any;
    nftCache: any;
    baseMetadata: any;


    constructor(key:Object,
        network:string,
        payer_address:string,
        nftCacheFile:string,
        nftMapFile:string,
        _baseMetadata:object) {
        this.kp = load_key(key);
        this.connection = new solana.Connection(
            solana.clusterApiUrl(network),
            'confirmed'
        );

        this.wallet = new anchor.Wallet(this.kp);

        this.nftMap = JSON.parse(fs.readFileSync(nftMapFile).toString());
        this.nftCache = JSON.parse(fs.readFileSync(nftCacheFile).toString());

        this.baseMetadata = _baseMetadata;
    }

    public async setup() {
        console.log("Initializing NFT manager");
        this.mintAddress= await splToken.createMint(this.connection, this.kp, this.kp.publicKey, null, 0)
        console.log("Got mint", this.mintAddress);
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

        const metadataFile:string = this.nftMap[nftIdentifier]['metadata'];
        console.log(metadataFile);

        const imageUri = this.nftCache[this.nftMap[nftIdentifier]['image']];

        const extMetadata  = JSON.parse(fs.readFileSync(metadataFile).toString());
        console.log(this.baseMetadata);
        console.log(extMetadata);

        const combinedMetadata = Object.assign(this.baseMetadata, extMetadata);

        const _tempCombinedMetadata = JSON.stringify(combinedMetadata);
        console.log(_tempCombinedMetadata);
        
        const _replacedTemplate:any = await Eta.render(_tempCombinedMetadata, {
            uri: imageUri
        }, {
            'varName': 't'
        });

        console.log(_replacedTemplate);

        const finalMetadata = JSON.parse(_replacedTemplate);
        console.log("Final Metdata");
        console.log(JSON.stringify(finalMetadata, null, 2));

        mintNft(this.mintAddress, this.kp, this.connection);
    }



    // public async grant(toAddress:string, amount:number) {
    //     console.log(this.mint);
    //     console.log("Granting", amount, "tokens to", toAddress);

    //     await transfer(this.mint, this.kp, toAddress,
    //         this.connection, amount);
    // }
}
