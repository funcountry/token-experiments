const solana = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const mplTokenMetadata = require("@metaplex-foundation/mpl-token-metadata");
const metaplex = require('@metaplex/js');
const key = require('./key.json');

const run = async() => {
    const kp = solana.Keypair.fromSecretKey(Buffer.from(key));

    const connection = new solana.Connection(
        solana.clusterApiUrl('mainnet-beta'),
        'confirmed'
    );

    const tokenProd = new solana.PublicKey("FFw9M6C6evR6MFVVyZoXGVYUR51VsHuo8thgsuLfkgPU");
    // const tokenDev = new solana.PublicKey("2bAi3aaZsySPCTKj6j26omRwL2yiWTiQCTt1Q4dv1RYo");

    console.log("Getting mint");

    var mint = await splToken.getMint(connection, tokenProd);
    console.log(mint);

    console.log("Getting PDA");
    const metadata = await mplTokenMetadata.Metadata.getPDA(mint.address);
    console.log("Metadata");
    console.log(metadata);

    const metadataData = new mplTokenMetadata.DataV2({
        uri :'https://raw.githubusercontent.com/funcountry/token-data/main/fcp-token.json',
        name: 'HOLDEM',
        symbol: 'HOLDEM',
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
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
        mint: mint.address
    });
    console.log("CreateMetadataV2");
    console.log(createMetadatatx);

    const createTxDetails = await solana.sendAndConfirmTransaction(
        connection, createMetadatatx, [kp]);
    console.log(createTxDetails);


};

run();

