const solana = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const mplTokenMetadata = require("@metaplex-foundation/mpl-token-metadata");
const metaplex = require('@metaplex/js');
const anchor = require("@project-serum/anchor");

function load_key(key:any) {
    return solana.Keypair.fromSecretKey(Buffer.from(key));
}

async function transfer(mint:any, kp: any, toAddress: string, connection: any, amount: number) {
    // const mintPublicKey = new solana.PublicKey(tokenMintAddress);
    // console.log(splToken);
    // console.log(splToken.Token);
    // const mintToken = new splToken.Token(
    //     connection,
    //     mintPublicKey,
    //     splToken.TOKEN_PROGRAM_ID,
    //     wallet.payer // the wallet owner will pay to transfer and to create recipients associated token account if it does not yet exist.
    // );

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

    // const receiverAccount = await splToken.getAccount(connection, toTokenAccount.address);
    // console.log("Receiver account");
    // console.log(receiverAccount.address.toString());


//     instructions.push(
//         splToken.Token.createTransferInstruction(
//             splToken.TOKEN_PROGRAM_ID,
//             fromTokenAccount.address,
//             associatedDestinationTokenAddr,
//             wallet.publicKey,
//             [],
//             amount
//         )
//     );

//     const transaction = new solana.Transaction().add(...instructions);
//     transaction.feePayer = wallet.publicKey;
//     transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

//     const transactionSignature = await connection.sendRawTransaction(
//         transaction.serialize(),
//         { skipPreflight: true }
//     );

//     await connection.confirmTransaction(transactionSignature);
}


export class HoldemTokenManager {
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
