import * as pinata from './pinata';
import fs from 'fs';

export async function uploadNfts(nftMapFile:string, nftCacheFile:string, jwt:string) {
    const nftMap = JSON.parse(fs.readFileSync(nftMapFile).toString());
    console.log(nftMap);
    const nftCache = JSON.parse(fs.readFileSync(nftCacheFile).toString());
    console.log(nftCache);
    // console.log(nftMapFile);
    // const nftMap:object = require(nftMapFile);
    // console.log(nftMap);
    for(const key in nftMap) {
        const nftData = nftMap[key];
        const imagePath = nftData['image'];
        console.log(key);
        console.log(nftData);

        if(!(imagePath in nftCache)) {
            console.log("Needs upload", imagePath);

            const url = await pinata.pinataUpload(
                imagePath,
                jwt,
                ""
            );

            console.log("Uploaded to", url);
            nftCache[imagePath] = url;
        }
    }

    console.log(nftCache);
    await fs.writeFileSync(nftCacheFile, JSON.stringify(nftCache));
}

export async function getNftUri(filename:string) {
}
