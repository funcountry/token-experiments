const solana = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const mplTokenMetadata = require("@metaplex-foundation/mpl-token-metadata");
const metaplex = require('@metaplex/js');
const anchor = require("@project-serum/anchor");

function load_key(key:any) {
    return solana.Keypair.fromSecretKey(Buffer.from(key));
}

async function transfer(tokenMintAddress: string, wallet: any, to: string, connection: any, amount: number) {
    const mintPublicKey = new solana.PublicKey(tokenMintAddress);
    console.log(splToken);
    console.log(splToken.Token);
    const mintToken = new splToken.Token(
        connection,
        mintPublicKey,
        splToken.TOKEN_PROGRAM_ID,
        wallet.payer // the wallet owner will pay to transfer and to create recipients associated token account if it does not yet exist.
    );

    const fromTokenAccount = await mintToken.getOrCreateAssociatedAccountInfo(
        wallet.publicKey
    );

    const destPublicKey = new solana.PublicKey(to);

    // Get the derived address of the destination wallet which will hold the custom token
    const associatedDestinationTokenAddr = await splToken.Token.getAssociatedTokenAddress(
        mintToken.associatedProgramId,
        mintToken.programId,
        mintPublicKey,
        destPublicKey
    );

    const receiverAccount = await connection.getAccountInfo(associatedDestinationTokenAddr);

    // const instructions: solana.TransactionInstruction[] = [];
    const instructions:Array<any> = [];

    // instructions = new Array<solana.TransactionInstruction>();

    if (receiverAccount === null) {

        instructions.push(
            splToken.Token.createAssociatedTokenAccountInstruction(
                mintToken.associatedProgramId,
                mintToken.programId,
                mintPublicKey,
                associatedDestinationTokenAddr,
                destPublicKey,
                wallet.publicKey
            )
        )

    }

    instructions.push(
        splToken.Token.createTransferInstruction(
            splToken.TOKEN_PROGRAM_ID,
            fromTokenAccount.address,
            associatedDestinationTokenAddr,
            wallet.publicKey,
            [],
            amount
        )
    );

    const transaction = new solana.Transaction().add(...instructions);
    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

    const transactionSignature = await connection.sendRawTransaction(
        transaction.serialize(),
        { skipPreflight: true }
    );

    await connection.confirmTransaction(transactionSignature);
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

    public async grant(to_address:string, amount:number) {
        console.log(this.mint);
        console.log("Granting", amount, "tokens to", to_address);

        await transfer(this.mint.address, this.wallet, to_address,
            this.connection, amount);
    }
}
