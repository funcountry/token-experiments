import FormData from 'form-data';
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

    const res = await request.post({
        uri: `https://api.pinata.cloud/pinning/pinFileToIPFS`,
        headers: {
            Authorization: `Bearer ${jwt}`,
        },
        method: 'POST',
        body: data,
    });

    // const json:any = await res.json();
    // console.log(json);
    // return json.IpfsHash;
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
