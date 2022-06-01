import * as pinata from './helpers/pinata';
const config = require('../config.json');

console.log(pinata);

const run = async() => {
    await pinata.pinataUpload(
        "./nfts/citizen_placements_v1/assets/0.gif",
        "",
        Buffer.from(JSON.stringify("{}")),
        config.pinataJwt,
        null
    );
};

run();
