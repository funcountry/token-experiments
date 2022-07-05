import * as web3 from '@solana/web3.js';
import * as spl from '@solana/spl-token';

const config = require('../config.json');
const key = require('../key.json');


const run = async() => {
    console.log("CONNECTING TO DEVNET");
    const con = new web3.Connection(
        'https://api.devnet.solana.com',
        'confirmed'
    );

    console.log("\nLOADING KEYPAIR");
    const wallet = web3.Keypair.fromSecretKey(Buffer.from(key));
    console.log("\tMINTING WALLET PUBLIC KEY", wallet.publicKey.toString());

    console.log("\nCREATING MINT");
    /**
     * Create and initialize a new mint
     *
     * @param connection      Connection to use
     * @param payer           Payer of the transaction and initialization fees
     * @param mintAuthority   Account or multisig that will control minting
     * @param freezeAuthority Optional account or multisig that can freeze token accounts
     * @param decimals        Location of the decimal place
     * @param keypair         Optional keypair, defaulting to a new random one
     * @param confirmOptions  Options for confirming the transaction
     * @param programId       SPL Token program account
     *
     * @return Address of the new mint
     */
    const mint = await spl.createMint(
        con,
        wallet, // payer
        wallet.publicKey, // mintAuthority
        wallet.publicKey, // freezeAuthority
        0 // decimals
    );
    console.log("\tNEW MINT ADDRESS", mint.toString());

    console.log("\nGETTING DESTINATION ACCOUNT");
    const destPublicAddress = new web3.PublicKey("sjZcLR8dVxz1VxJtBAVWSLWot4eVEF3m84UPKJvobRE");
    console.log("\tSOLANA ADDRESS", destPublicAddress.toString());

    /**
     * Retrieve the associated token account, or create it if it doesn't exist
     *
     * @param connection               Connection to use
     * @param payer                    Payer of the transaction and initialization fees
     * @param mint                     Mint associated with the account to set or verify
     * @param owner                    Owner of the account to set or verify
     * @param allowOwnerOffCurve       Allow the owner account to be a PDA (Program Derived Address)
     * @param commitment               Desired level of commitment for querying the state
     * @param confirmOptions           Options for confirming the transaction
     * @param programId                SPL Token program account
     * @param associatedTokenProgramId SPL Associated Token program account
     *
     * @return Address of the new associated token account
     */
    const destTokenAccount = await spl.getOrCreateAssociatedTokenAccount(
        con,
        wallet, // payer
        mint, // mint
        destPublicAddress
    );
    console.log("\tTOKEN ACCOUNT ADDRESS", destTokenAccount.address.toString());


    console.log("\nMINTING ONE TOKEN TO DESTINATION");
    /**
     * Mint tokens to an account
     *
     * @param connection     Connection to use
     * @param payer          Payer of the transaction fees
     * @param mint           Mint for the account
     * @param destination    Address of the account to mint to
     * @param authority      Minting authority
     * @param amount         Amount to mint
     * @param multiSigners   Signing accounts if `authority` is a multisig
     * @param confirmOptions Options for confirming the transaction
     * @param programId      SPL Token program account
     *
     * @return Signature of the confirmed transaction
     */
    const mintToRes = await spl.mintTo(
        con,
        wallet, // payer
        mint,   // mint
        destTokenAccount.address,   // destination
        wallet,
        1
    );
    console.log("\tMINT TO RESULT", mintToRes);
};

run();
