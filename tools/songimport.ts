import fs from 'fs';

// import { SongDoc } from '@/types';
import { dbInit } from '@/db/mongodb';
import { songDocCollection } from '@/db/SongDoc';

const assetsPath = './app/public/assets/';

interface SongInfo {
    id: string;
    title: string;
    artist: string;
}

async function main() {
    await dbInit();

    const path = `${assetsPath}songs/`;
    const list = fs.readdirSync(path);
    for (const file of list) {
        if (!file.endsWith('.json'))
            continue;

        const info = JSON.parse(fs.readFileSync(`${path}${file}`, { encoding: 'utf8' })) as SongInfo;

        await songDocCollection.insertOne({
            _id: info.id,
            id: info.id,
            title: info.title,
            artist: info.artist,
        });

        console.log(file);
    }
    console.log('end');
}

main().catch(e => console.error(e));