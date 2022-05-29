const solana = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const mplTokenMetadata = require("@metaplex-foundation/mpl-token-metadata");
const metaplex = require('@metaplex/js');

function load_key(key:any) {
    return solana.Keypair.fromSecretKey(Buffer.from(key));
}

export class HoldemTokenManager {
    kp: any;
    connection: any;

    constructor(key:Object, network:string) {
        this.kp = load_key(key);
        this.connection = new solana.Connection(
            solana.clusterApiUrl(network),
            'confirmed'
        );
    }

    public grant(wallet:string, amount:number) {
        console.log("Granting", amount, "tokens to", wallet);
    }
}
