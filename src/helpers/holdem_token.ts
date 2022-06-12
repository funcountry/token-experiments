const solana = require('@solana/web3.js');
const splToken = require('@solana/spl-token');

import * as event_data from './event_data';

function load_key(key:any) {
    return solana.Keypair.fromSecretKey(Buffer.from(key));
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

    public async grant(
        db:any,
        grant_id:string,
        toAddress:string,
        amount:number) {
        console.log("Granting", amount, "tokens to", toAddress);

        if(amount > 1000000000000) {
            console.log("TOO MANY TOKENS TRYING TO BE SENT NOT DOING IT");
            return process.exit(1);
        }

        const fromTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
            this.connection,
            this.kp,
            this.mint.address,
            this.kp.publicKey);
        console.log("From Token Account", fromTokenAccount.address.toString());

        const toWallet = new solana.PublicKey(toAddress);

        const toTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
            this.connection,
            this.kp,
            this.mint.address,
            toWallet);
        console.log("To Token Account", toTokenAccount.address.toString());

        const freeze = this.mint.freezeAuthority;

        console.log("THAWING ACCOUNT");

        try {
            let tx = new solana.Transaction().add(
                splToken.createThawAccountInstruction(
                    toTokenAccount.address,
                    this.mint.address,
                    freeze,
                    [],
                    splToken.TOKEN_PROGRAM_ID
                )
            );

            const res = await solana.sendAndConfirmTransaction(
                this.connection,
                tx, [this.kp], solana.ConfirmOptions);
            console.log(res);

            await event_data.log_transaction(
                db,
                grant_id,
                'thaw',
                res,
                'success',
                toTokenAccount.address.toString()
            );
        }
        catch(e) {
            console.log("Failed to thaw account");
            console.log(e);
            await event_data.log_transaction(
                db,
                grant_id,
                'thaw',
                '',
                'failed',
                toTokenAccount.address.toString()
            );
        }


        console.log("TRANSFERING",amount,"TOKENS (", amount/1000000000, ")");

        const res = await splToken.transfer(
            this.connection,
            this.kp,
            fromTokenAccount.address,
            toTokenAccount.address,
            this.kp,
            amount
        );
        console.log(res);

        await event_data.log_transaction(
            db,
            grant_id,
            'transfer',
            res,
            'success',
            toTokenAccount.address.toString()
        );

        //
        console.log("FREEZING ACCOUNT");

        try {
            let txFreeze = new solana.Transaction().add(
                splToken.createFreezeAccountInstruction(
                    toTokenAccount.address,
                    this.mint.address,
                    freeze,
                    [],
                    splToken.TOKEN_PROGRAM_ID
                )
            );

            const resFreeze = await solana.sendAndConfirmTransaction(
                this.connection,
                txFreeze, 
                [this.kp], 
                solana.ConfirmOptions);
            console.log("Back from sendandconfirm");
            console.log(resFreeze);

            await event_data.log_transaction(
                db,
                grant_id,
                'freeze',
                resFreeze,
                'success',
                toTokenAccount.address.toString()
            );
        }
        catch(e) {
            console.log("Failed to freeze account");
            console.log(e);

            await event_data.log_transaction(
                db,
                grant_id,
                'freeze',
                '',
                'failed',
                toTokenAccount.address.toString()
            );
        }
    }
}
