// official site data
export interface UcsDoc {
    _id: string;
    id: number;
    time: Date;
    maker: string;
    makerCountry: string;
    songId: string;
    mode: string;
    level: number;
    file: string;
    description: string;
}

export interface SongDoc {
    _id: string;
    id: string;
    title: string;
    artist: string;
}

export interface PostDoc {
    _id: string; // == ucsdoc id
    id: number;
    time: Date;
    author: string;
    ucs: UcsDoc;
    song: SongDoc;
    grade: string;
    description: string;
    youtubeUrl: string;
    tags: string[];
}

export interface PostParamDoc {
  _id: string;
  params: string[];
}

export interface TagDoc {
  _id: string;
  description: string;
}

export interface UserDoc {
    _id: string;
    id: string;
    pw: string; // hash hex string
    level: number;
}
