import fs from 'fs';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import jquery from 'jquery';

import { UcsDoc } from '../types';
import { ucsDocCollection } from '../db/UcsDoc';

const DOMAIN = 'http://www.piugame.com/';
const LIST_URL = `${DOMAIN}bbs/board.php?bo_table=ucs&page=`;
const DATA_URL = `${DOMAIN}bbs/board.php?bo_table=ucs&wr_id=`;
const SONG_URL = `${DOMAIN}piu.ucs/piu.visual/ucs/mp3/`
const SONG_IMG_URL = `${DOMAIN}piu.ucs/piu.visual/ucs/img/`

const assetsPath = './app/public/assets/';

async function getTextFromURL(url: string): Promise<string> {
    const req = await fetch(url, { headers: { Referer: DOMAIN } });
    if (!req.ok)
        throw new Error(`error ${url} ${req.status} ${req.statusText}`);

    return req.text();
}

async function getBufferFromURL(url: string): Promise<Buffer> {
    const req = await fetch(url, { headers: { Referer: DOMAIN } });
    if (!req.ok)
        throw new Error(`error ${url} ${req.status} ${req.statusText}`);

    return req.buffer();
}

export async function getList(page: number): Promise<number[]> {
    const url = `${LIST_URL}${page}`;
    const text = await getTextFromURL(url);

    const dom = new JSDOM(text);
    const $ = jquery(dom.window) as any;

    const list = $('#fboardlist').find('tbody').find('tr');
    const r: number[] = [];

    for (const item of list) {
        const id = Number($(item).find('[data-ucs_id]').attr('data-ucs_id'));
        r.push(id);
    }

    console.log(`page ${page} ${r.length}`);
    return r;
}

export async function updateUcs(id: number): Promise<UcsDoc> {
    const doc = await ucsDocCollection.findOne({ id });
    if (doc) {
        // console.log(`data ${id} skip...`);
        return doc;
    }

    const url = `${DATA_URL}${id}`;
    const text = await getTextFromURL(url);

    const dom = new JSDOM(text);
    const $ = jquery(dom.window) as any;

    const songTitle = $('.song_title').text();
    const songArtist = $('.song_artist').text().slice(1, -1);

    const infoTable = $('.step_info').find('tbody tr');
    const makerCountry = infoTable.slice(0, 1).find('td').slice(0, 1).children().attr('title');
    const makerName = infoTable.slice(0, 1).find('td').slice(0, 1).children().remove().end().text().trim();
    const time = new Date(`20${infoTable.slice(0, 1).find('td').slice(2, 3).text()}+09:00`);
    let mode = infoTable.slice(1, 2).find('td').slice(0, 1).text();
    if ('coop' == mode)
        mode += infoTable.slice(1, 2).find('td').slice(1, 2).text();

    const level = +(infoTable.slice(2, 3).find('td').slice(0, 1).text());
    const ucsPlayerUrl = $('.title_menu .btnUCSPlayr').attr('rel').split('#');

    const songId = ucsPlayerUrl[1].substr(-4);
    const ucsUrl = `${DOMAIN}${ucsPlayerUrl[2].substr(4)}.ucs`;
    const ucsData = await getTextFromURL(ucsUrl);

    const description = $('#ucs_step_info').children().remove().end().text().trim();
    const newDoc: UcsDoc = {
        _id: `${id}`,
        id,
        time,
        maker: makerName,
        makerCountry,
        songId,
        mode,
        level,
        file: ucsData,
        description,
    };

    await downloadSongs(songId, songTitle, songArtist);
    await ucsDocCollection.insertOne(newDoc);

    // console.log(`data ${id}`);

    return { ...newDoc, file: '' };
}

async function downloadSongs(id: string, title: string, artist: string) {
    const path = `${assetsPath}songs/`;
    const jsonFile = `${path}${id}.json`;

    if (fs.existsSync(jsonFile))
        return;

    const songFile = `${path}${id}.mp3`;
    const songImgFile = `${path}${id}.jpg`;

    const songUrl = `${SONG_URL}${id}.mp3`;
    const songImgUrl = `${SONG_IMG_URL}${id}.jpg`;

    const json = JSON.stringify({ id, title, artist });
    const songBuf = await getBufferFromURL(songUrl);
    const songImgBuf = await getBufferFromURL(songImgUrl).catch(e => {
        console.warn(e)
        return Buffer.alloc(0)
    });

    fs.writeFileSync(jsonFile, json, { mode: 0o644 });
    fs.writeFileSync(songFile, songBuf, { mode: 0o644 });
    fs.writeFileSync(songImgFile, songImgBuf, { mode: 0o644 });
}

