import Arweave from "arweave";
import dotenv from "dotenv";
const fs = require('fs');
dotenv.config();

const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
    timeout: 20000, // Network request timeouts in milliseconds
    logging: false, // Disable network request logging
});

// Submits a transaction and reads the data
const run = async() => {
    const key = require('./arweave.json');
    console.log(key);

    const data = fs.readFileSync('./metadata.json');
    console.log(data);

    const transaction = await arweave.createTransaction(
        {
            data: data,
        },
        key
    );

    await arweave.transactions.sign(transaction, key);
    await arweave.transactions.post(transaction);

    // Transaction ID gets updated after arweave.transactions.post, which is a bit unintuitive
    console.log("transaction ID", transaction.id);

    // Read data back
    const transactionData = await arweave.transactions.getData(transaction.id);
    console.log(
        "transaction data",
        transactionData
    );

};

run();
