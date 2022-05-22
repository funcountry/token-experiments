const solana = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const mplTokenMetadata = require("@metaplex-foundation/mpl-token-metadata");
const metaplex = require('@metaplex/js');
const fs = require('fs');
const key = require('./key.json');
console.log(key);


const kp = solana.Keypair.fromSecretKey(Buffer.from(key));



console.log(kp);

const run = async() => {
	console.log(metaplex);
	console.log(mplTokenMetadata);
	//console.log(splToken);


	const connection = new solana.Connection(solana.clusterApiUrl("devnet"));
	console.log(connection);

	//await connection.requestAirdrop(kp.publicKey, 1000000000);
    const balance = await connection.getBalance(kp.publicKey)
	console.log(balance);

	console.log(splToken);
	var mint = await splToken.createMint(connection, kp, kp.publicKey, null, 9)
	console.log("Mint");
	console.log(mint);

	const fromTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(connection, kp, mint, kp.publicKey);
	console.log("FromTokenAccount");
	console.log(fromTokenAccount);

	let signature = await splToken.mintTo(connection, kp, mint, fromTokenAccount.address, kp.publicKey, 1000000, []);
	console.log(signature);

	const tokBalance = await connection.getTokenAccountBalance(fromTokenAccount.address);
	console.log(tokBalance);

	const metadata = await mplTokenMetadata.Metadata.getPDA(kp.publicKey);
	console.log("Metadata");
	console.log(metadata);

	const metadataData = new mplTokenMetadata.DataV2({
            uri :'https://raw.githubusercontent.com/funcountry/token-data/main/fcp-token.json',
            name: 'HOLDEM',
            symbol: 'HOLDEM',
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null,
            tokenStandard: mplTokenMetadata.TokenStandard.Fungible
	});

	console.log("MetadataData");
	console.log(metadataData); 
    console.log("About to create");

	const createMetadatatx = new mplTokenMetadata.CreateMetadataV2({ feePayer: kp.publicKey }, {
			metadata,
			metadataData,
			updateAuthority: kp.publicKey,
			mintAuthority: kp.publicKey,
			mint: mint.publicKey
		});
	console.log("CreateMetadataV2");
	console.log(createMetadatatx);

    const tx = new solana.Transaction({feePayer: kp.publicKey});
    tx.add(createMetadatatx);

	const createTxDetails = await solana.sendAndConfirmTransaction(
        connection, tx, [kp]);
	console.log(createTxDetails);


};

run();
