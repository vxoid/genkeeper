import { getSubtitles } from 'youtube-caption-extractor';
import ytdl from 'ytdl-core';
import axios from 'axios';

const youtubeStandartRegex: RegExp = /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(&.*)?$/;
const youtubeShortRegex: RegExp = /^(https?:\/\/)?(www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(\?.*)?$/;
const youtubeEmbedRegex: RegExp = /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(\/)?(\?.*)?$/;
const youtubeShortEmbedRegex: RegExp = /^(https?:\/\/)?(www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})(\/)?(\?.*)?$/;
const GenKeeperHost = "http://127.0.0.1:8080";

enum YoutubeLinkType {
  YoutubeStandartRegex,
  YoutubeShortRegex,
  YoutubeEmbedRegex,
  YoutubeShortEmbedRegex,
}

type GenKeeperError = {
  detail: string
}

type GenKeeperResponse = {
  query: string,
  prediction: boolean
}

export class APIError {
  constructor(msg: string, code: number) {
    this.msg = msg;
    this.code = code;
  }

  public msg: string;
  public code: number;
}

export class ParseError {
  constructor(msg: string) {
    this.msg = msg;
  }

  public msg: string;
}

interface Subtitle {
  start: string;
  dur: string;
  text: string;
}

export class YoutubeSubtitle {
  constructor(start_secs: number = 0, dur_secs: number = 0, text: string = "") {
    this.start_secs = start_secs;
    this.dur_secs = dur_secs;
    this.text = text;
  }

  public static parse(s: Subtitle): YoutubeSubtitle | null {
    const start = parseFloat(s.start);
    if (Number.isNaN(start)) {
      console.log(`cannot parse '${s}' as valid subtitle`)
      return null;
    }
    const dur = parseFloat(s.dur)
    if (Number.isNaN(dur)) {
      console.log(`cannot parse '${s}' as valid subtitle`)
      return null;
    }

    return new YoutubeSubtitle(start, dur, s.text);
  }

  public static concat(s: YoutubeSubtitle[]): YoutubeSubtitle {
    if (s.length < 2) {
      return (s[0] || new YoutubeSubtitle());
    }

    const sorted_s = s.sort((a, b) => a.start_secs - b.start_secs);

    const start = sorted_s[0].start_secs;
    const dur = sorted_s[sorted_s.length-1].start_secs + sorted_s[sorted_s.length-1].dur_secs - start; 
    const text = sorted_s.map((s) => s.text).join(' ');

    return new YoutubeSubtitle(start, dur, text);
  }

  public concat(s: YoutubeSubtitle): YoutubeSubtitle {
    return YoutubeSubtitle.concat([this, s]);
  }

  toString(): string {
    return `{ text: "${this.text}" }`;
  }
  
  start_secs: number;
  dur_secs: number;
  text: string;
}

export class Subtitles {
  constructor (subtitles: YoutubeSubtitle[] = []) {
    this.subtitles = subtitles.sort((a, b) => a.start_secs - b.start_secs);
  }

  public static parse(subtitles: Subtitle[]): Subtitles {
    return new Subtitles(subtitles.map((s) => YoutubeSubtitle.parse(s)).filter((s) => s != null).map((s) => s as YoutubeSubtitle));
  }

  public batch(time_secs: number): Subtitles {
    let subtitles = [];
    let batch_start = 0;
    let target_time = time_secs;

    for (let i = 1; i < this.subtitles.length; i++) {
      const dif = Math.abs(target_time - (this.subtitles[i].start_secs));
      const closest_dif = Math.abs(target_time - (this.subtitles[i - 1].start_secs));

      if (closest_dif < dif) {
        subtitles.push(YoutubeSubtitle.concat(this.subtitles.slice(batch_start, i)));
        batch_start = i;
        target_time += time_secs;
      }

      if (i == this.subtitles.length - 1) {
        subtitles.push(YoutubeSubtitle.concat(this.subtitles.slice(batch_start, i + 1)));
        break;
      }
    }

    return new Subtitles(subtitles);
  }

  public async filterAI(): Promise<Subtitles> {
    let subtitles = [];
    const url = `${GenKeeperHost}/v1/predict/penis idk`;
    let response = await axios.get<GenKeeperResponse>(url);
    console.log(response.data.query);

    for (let i = 0; i < this.subtitles.length; i++) {
      try {
        let response = await axios.get<GenKeeperResponse>(`${GenKeeperHost}/v1/predict/${this.subtitles[i].text}`);
        
        if (response.data.prediction) {
          subtitles.push(this.subtitles[i])
        }
      } catch (error) {
        console.log("err");
        if (axios.isAxiosError(error) && error.response) {
          let error_data = error.response?.data as GenKeeperError;
          console.log(`cannot predict captions: ${error_data.detail}`);
        } else {
          console.log(`cannot predict captions: ${error}`);
        }
      }
    }

    return new Subtitles(subtitles);
  }

  subtitles: YoutubeSubtitle[]; 
}

export class YoutubeLink {
  constructor(id: string) {
    this.id = id;
  }

  id: string

  public getId() {
    return this.id;
  }

  public async fetchCaptions(): Promise<Subtitles> {
    const subtitles = Subtitles.parse(await getSubtitles({ videoID: this.id, lang: "en" }).catch());
    return subtitles.batch(15);
  }

  // public async download() {
    // ytdl()
  // }

  static parseLink(link: string): YoutubeLink | ParseError {
    const id = this.parseId(link);
    if (id instanceof ParseError)
      return id;

    return new YoutubeLink(id);
  }

  static getLinkType(link: string): YoutubeLinkType | null {
    if (youtubeStandartRegex.test(link)) {
      return YoutubeLinkType.YoutubeStandartRegex;
    }
    if (youtubeShortRegex.test(link)) {
      return YoutubeLinkType.YoutubeShortRegex;
    }
    if (youtubeEmbedRegex.test(link)) {
      return YoutubeLinkType.YoutubeEmbedRegex;
    }
    if (youtubeShortEmbedRegex.test(link)) {
      return YoutubeLinkType.YoutubeShortEmbedRegex;
    }

    return null;
  }

  static parseId(link: string): string | ParseError {
    const linkType = YoutubeLink.getLinkType(link);
    if (linkType == null) {
      return new ParseError(`"${link}" is not a valid youtube link`);
    }
    let id: string | null = null;

    if (linkType == YoutubeLinkType.YoutubeStandartRegex) {
      const match = link.match(youtubeStandartRegex);
      id = match && match[3] ? match[3] : null;
    }
    if (linkType == YoutubeLinkType.YoutubeShortRegex) {
      return new ParseError(`short links are not supported yet, use regular ones instead (youtube.com/watch?v=abcdefghijk)`);
    }
    if (youtubeEmbedRegex.test(link)) {
      const match = link.match(youtubeEmbedRegex);
      id = match && match[3] ? match[3] : null;
    }
    if (linkType == YoutubeLinkType.YoutubeShortEmbedRegex) {
      const match = link.match(youtubeShortEmbedRegex);
      id = match && match[3] ? match[3] : null;
    }

    if (id == null) {
      return new ParseError(`cannot find video id in "${link}"`);
    }
    if (!YoutubeLink.isValidId(id)) {
      return new ParseError(`"${link}" contains not valid id`);
    }

    return id;
  }

  static isValidId(id: string): boolean {
    return id.length == 11;
  }
}

export function isYoutubeLink(link: string): boolean {
  return YoutubeLink.getLinkType(link) != null;
}