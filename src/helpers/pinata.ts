import * as node_fetch from 'node-fetch';
import fs from 'fs';


// import log from 'loglevel';
// import fetch from 'node-fetch';
// import FormData from 'form-data';
// import fs from 'fs';
// import { setImageUrlManifest } from './file-uri';

// async function sleep(ms: number): Promise<void> {
//   console.log('waiting');
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

async function uploadMedia(media:string, jwt:string) {
    const data = new FormData();
    data.append('file', fs.createReadStream(media));

    const res = await node_fetch(`https://api.pinata.cloud/pinning/pinFileToIPFS`, {
        headers: {
            Authorization: `Bearer ${jwt}`,
        },
        method: 'POST',
        body: data,
    });

    const json:any = await res.json();
    return json.IpfsHash;
}

export async function pinataUpload(
    image: string,
    animation: string,
    manifestBuffer: Buffer,
    jwt: string,
    gateway: string | null,
) {
    const gatewayUrl = gateway ? gateway : `https://ipfs.io`;

    const imageCid = await uploadMedia(image, jwt);
    console.log('uploaded image: ', `${gatewayUrl}/ipfs/${imageCid}`);
    await sleep(500);

    let animationCid:any = undefined;
    let animationUrl:any = undefined;
    if (animation) {
        animationCid = await uploadMedia(animation, jwt);
        console.log('uploaded image: ', `${gatewayUrl}/ipfs/${animationCid}`);
    }

    const mediaUrl = `${gatewayUrl}/ipfs/${imageCid}`;
    if (animationCid) {
        animationUrl = `${gatewayUrl}/ipfs/${animationCid}`;
    }

    const manifestJson = await setImageUrlManifest(
        manifestBuffer.toString('utf8'),
        mediaUrl,
        animationUrl,
    );

    fs.writeFileSync('tempJson.json', JSON.stringify(manifestJson));

    const metadataCid = await uploadMedia('tempJson.json', jwt);

    await sleep(500);

    const link = `${gatewayUrl}/ipfs/${metadataCid}`;
    console.log('uploaded manifest: ', link);

    return [link, mediaUrl, animationUrl];
}
