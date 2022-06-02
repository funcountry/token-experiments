import * as pinata from './pinata';
import fs from 'fs';

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

async function transfer(mint:any, kp: any, toAddress: string, connection: any, amount: number) {
    const fromTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
        connection,
        kp,
        mint.address,
        kp.publicKey);
    console.log("From Token Account");
    console.log(fromTokenAccount.address.toString());

    const toWallet = new solana.PublicKey(toAddress);

    const toTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
        connection,
        kp,
        mint.address,
        toWallet);
    console.log("To Token Account");
    console.log(toTokenAccount.address.toString());

    const res = await splToken.transfer(
        connection,
        kp,
        fromTokenAccount.address,
        toTokenAccount.address,
        kp,
        amount
    );
    console.log(res);
}


export class NftManager {
    kp: any;
    connection: any;
    token: any;
    mint: any;
    payer_address: any;
    wallet: any;


    constructor(key:Object, network:string, token_address:string, payer_address:string) {
        this.kp = load_key(key);
        this.connection = new solana.Connection(
            solana.clusterApiUrl(network),
            'confirmed'
        );

        this.token = new solana.PublicKey(token_address);
        this.wallet = new anchor.Wallet(this.kp);
    }

    public async setup() {
        console.log("Initializing token manager");
        this.mint = await splToken.getMint(this.connection, this.token);
        console.log("Got mint", this.mint);
    }

    public async grant(toAddress:string, amount:number) {
        console.log(this.mint);
        console.log("Granting", amount, "tokens to", toAddress);

        await transfer(this.mint, this.kp, toAddress,
            this.connection, amount);
    }
}
