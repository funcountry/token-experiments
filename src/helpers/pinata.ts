import FormData from 'form-data';
import axios from 'axios';
import * as request from 'request';
// import node_fetch from 'node-fetch';
// import fetch from 'node-fetch';
import fs from 'fs';
// const fetch = require('node-fetch');


// import log from 'loglevel';
// import fetch from 'node-fetch';
// import fs from 'fs';
// import { setImageUrlManifest } from './file-uri';

// async function sleep(ms: number): Promise<void> {
//   console.log('waiting');
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

async function uploadMedia(media:string, jwt:string) {
    const data = new FormData();
    data.append('file', fs.createReadStream(media));

    try {
        const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
            headers: {
                'Content-Type': `multipart/form-data;`,
                Authorization: `Bearer ${jwt}`,
            }
        });
        const json = res.data;
        // console.log(json);
        return json.IpfsHash;
    }
    catch(e) {
        console.log(e);
    }
}

export async function pinataUpload(
    image: string,
    jwt: string,
    gateway: string | null,
) {
    const gatewayUrl = gateway ? gateway : `https://cf-ipfs.com`;

    const imageCid = await uploadMedia(image, jwt);
    console.log('uploaded image: ', `${gatewayUrl}/ipfs/${imageCid}`);
    // await sleep(500);
    //

    const mediaUrl = `${gatewayUrl}/ipfs/${imageCid}`;
    return mediaUrl;


    // const manifestJson = await setImageUrlManifest(
    //     manifestBuffer.toString('utf8')
    // );

    // fs.writeFileSync('tempJson.json', JSON.stringify(manifestJson));

    // const metadataCid = await uploadMedia('tempJson.json', jwt);

    // await sleep(500);

    // const link = `${gatewayUrl}/ipfs/${metadataCid}`;
    // console.log('uploaded manifest: ', link);

    // return [link, mediaUrl, animationUrl];
}
