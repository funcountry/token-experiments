import {pinataUpload} from './helpers/pinata';
const solana = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const mplTokenMetadata = require("@metaplex-foundation/mpl-token-metadata");
const metaplex = require('@metaplex/js');
const key = require('../key.json');
const config = require('../config.json');



// const nft_json = "https://raw.githubusercontent.com/funcountry/token-data/main/nfts/citizens_v1/firstplace.json";



const run = async() => {
    const kp = solana.Keypair.fromSecretKey(Buffer.from(key));

    const connection = new solana.Connection(
        solana.clusterApiUrl('devnet'),
        'confirmed'
    );

    const airdropSignature = await connection.requestAirdrop(
        kp.publicKey,
        solana.LAMPORTS_PER_SOL,
    );

    await connection.confirmTransaction(airdropSignature);

    const balance = await connection.getBalance(kp.publicKey)
    console.log(balance);

    var mint = await splToken.createMint(connection, kp, kp.publicKey, null, 0)
    console.log("Mint");
    console.log(mint.toString());

    const fromTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(connection, kp, mint, kp.publicKey);
    console.log("FromTokenAccount");
    console.log(fromTokenAccount);

    let signature = await splToken.mintTo(connection, kp, mint, fromTokenAccount.address, kp, 1);
    console.log(signature);

    const tokBalance = await connection.getTokenAccountBalance(fromTokenAccount.address);
    console.log(tokBalance);

    const metadata = await mplTokenMetadata.Metadata.getPDA(mint);
    console.log("Metadata");
    console.log(metadata);

    const metadataData = new mplTokenMetadata.DataV2({
        uri: nft_json,
        name: "Fun Country Poker Citizen's NFT",
        symbol: "",
        sellerFeeBasisPoints: 0,
        creators: [
            {
                "address": "sjZcLR8dVxz1VxJtBAVWSLWot4eVEF3m84UPKJvobRE",
                "share": 100
            }
        ],
        collection: {
            name: "Fun Country Poker Citizen's NFT",
            family: "Fun Country"
        },
        uses: null
    });

    console.log("MetadataData");
    console.log(metadataData); 
    console.log("About to create");

    const createMetadatatx = new mplTokenMetadata.CreateMetadataV2({ feePayer: kp.publicKey }, {
        metadata: metadata,
        metadataData: metadataData,
        updateAuthority: kp.publicKey,
        mintAuthority: kp.publicKey,
        mint: mint
    });
    console.log("CreateMetadataV2");
    console.log(createMetadatatx);

    const createTxDetails = await solana.sendAndConfirmTransaction(
        connection, createMetadatatx, [kp]);
    console.log(createTxDetails);

    console.log(mint.toString());

};

run();

