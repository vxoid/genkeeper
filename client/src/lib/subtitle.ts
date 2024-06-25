export interface Subtitle {
  start: string;
  dur: string;
  text: string;
}

export class YoutubeSubtitle {
  constructor(private startSecs: number = 0, private durSecs: number = 0, private text: string = "") {}

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

    const sorted_s = s.sort((a, b) => a.startSecs - b.startSecs);

    const start = sorted_s[0].startSecs;
    const dur = sorted_s[sorted_s.length-1].startSecs + sorted_s[sorted_s.length-1].durSecs - start; 
    const text = sorted_s.map((s) => s.text).join(' ');

    return new YoutubeSubtitle(start, dur, text);
  }

  public concat(s: YoutubeSubtitle): YoutubeSubtitle {
    return YoutubeSubtitle.concat([this, s]);
  }

  public textContent(): string {
    return this.text;
  }

  public start(): number {
    return this.startSecs;
  }

  public duration(): number {
    return this.durSecs;
  }

  public end(): number {
    return this.startSecs + this.durSecs;
  }

  toString(): string {
    return `{ start: ${this.startSecs}, dur: ${this.durSecs} }`;
  }
}