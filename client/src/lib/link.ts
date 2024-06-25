import { getSubtitles } from 'youtube-caption-extractor';
import { Subtitles } from './subtitles';
import { videoStorage } from './dotenv';
import { YoutubeVideo } from './video';
import * as path from 'path';
import ytdl from 'ytdl-core';

const youtubeStandartRegex: RegExp = /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(&.*)?$/;
const youtubeShortRegex: RegExp = /^(https?:\/\/)?(www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(\?.*)?$/;
const youtubeEmbedRegex: RegExp = /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(\/)?(\?.*)?$/;
const youtubeShortEmbedRegex: RegExp = /^(https?:\/\/)?(www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})(\/)?(\?.*)?$/;

enum YoutubeLinkType {
  YoutubeStandartRegex,
  YoutubeShortRegex,
  YoutubeEmbedRegex,
  YoutubeShortEmbedRegex,
}

export class ParseError {
  constructor(msg: string) {
    this.msg = msg;
  }

  public msg: string;
}

export class YoutubeLink {
  constructor(id: string) {
    this.id = id;
  }

  id: string

  public getId() {
    return this.id;
  }

  public getVideoPath(): string {
    return path.join(videoStorage, `${this.id}.mp4`);
  }

  public async fetchCaptions(): Promise<Subtitles> {
    const subtitles = Subtitles.parse(await getSubtitles({ videoID: this.id, lang: "en" }));
    return subtitles;
  }

  public async download(): Promise<YoutubeVideo> {
    return new Promise(async (resolve, reject) => {
      const video = new YoutubeVideo(this.getVideoPath());

      if (!(await video.exists())) {
        ytdl(`https://www.youtube.com/watch?v=${this.id}`, { quality: 'highest' })
          .pipe(video.createWriteStream())
          .on('finish', () => {
            resolve(video);
          })
          .on('error', reject);
      } else {
        resolve(video);
      }
    });
  }

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
    if (linkType === null) {
      return new ParseError(`"${link}" is not a valid youtube link`);
    }
    let id: string | null = null;

    if (linkType === YoutubeLinkType.YoutubeStandartRegex) {
      const match = link.match(youtubeStandartRegex);
      id = match && match[3] ? match[3] : null;
    }
    if (linkType === YoutubeLinkType.YoutubeShortRegex) {
      return new ParseError(`short links are not supported yet, use regular ones instead (youtube.com/watch?v=abcdefghijk)`);
    }
    if (youtubeEmbedRegex.test(link)) {
      const match = link.match(youtubeEmbedRegex);
      id = match && match[3] ? match[3] : null;
    }
    if (linkType === YoutubeLinkType.YoutubeShortEmbedRegex) {
      const match = link.match(youtubeShortEmbedRegex);
      id = match && match[3] ? match[3] : null;
    }

    if (id === null) {
      return new ParseError(`cannot find video id in "${link}"`);
    }

    return id;
  }
}

export function isYoutubeLink(link: string): boolean {
  return YoutubeLink.getLinkType(link) != null;
}