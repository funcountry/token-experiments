const solana = require('@solana/web3.js');
const splToken = require('@solana/spl-token');

function load_key(key:any) {
    return solana.Keypair.fromSecretKey(Buffer.from(key));
}

async function transfer(mint:any, kp: any, toAddress: string, connection: any, amount: number) {
    if(amount > 1000000000000) {
        console.log("TOO MANY TOKENS TRYING TO BE SENT NOT DOING IT");
        return process.exit(1);
    }

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

    const freeze = mint.freezeAuthority;

    console.log("THAWING ACCOUNT");

    try {
        let tx = new solana.Transaction().add(
            splToken.createThawAccountInstruction(
                toTokenAccount.address,
                mint.address,
                freeze,
                [],
                splToken.TOKEN_PROGRAM_ID
            )
        );

        const res = await solana.sendAndConfirmTransaction(
            connection,
            tx, [kp], solana.ConfirmOptions);
        console.log(res);
    }
    catch(e) {
        console.log("Failed to thaw account");
        // console.log(e);
    }


    console.log("TRANSFERING",amount,"TOKENS (", amount/1000000000, ")");

    const res = await splToken.transfer(
        connection,
        kp,
        fromTokenAccount.address,
        toTokenAccount.address,
        kp,
        amount
    );
    console.log(res);
    //
    console.log("FREEZING ACCOUNT");

    try {
        let txFreeze = new solana.Transaction().add(
            splToken.createFreezeAccountInstruction(
                toTokenAccount.address,
                mint.address,
                freeze,
                [],
                splToken.TOKEN_PROGRAM_ID
            )
        );

        const resFreeze = await solana.sendAndConfirmTransaction(
            connection,
            txFreeze, [kp], solana.ConfirmOptions);
        console.log(resFreeze);
    }
    catch(e) {
        console.log("Failed to freeze account");
        console.log(e);
    }
   

}


export class HoldemTokenManager {
    kp: any;
    connection: any;
    token: any;
    mint: any;
    payer_address: any;


    constructor(key:Object, endpoint:string, token_address:string, payer_address:string) {
        this.kp = load_key(key);
        this.connection = new solana.Connection(
            endpoint,
            'confirmed'
        );

        this.token = new solana.PublicKey(token_address);
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
