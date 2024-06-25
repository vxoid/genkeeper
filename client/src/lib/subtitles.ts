import { YoutubeSubtitle, type Subtitle } from './subtitle';
import { genKeeperAddress } from './dotenv';
import axios from 'axios';

function getRandomNumber(min: number, max: number): number {
  if (min === max)
    return min || max;
  if (min > max) {
    throw new Error("Min must be less than max in getRandomNumber");
  }

  const randomNumber = Math.random();
  const scaledNumber = Math.floor(randomNumber * (max - min + 1)) + min;
  return scaledNumber;
}

type GenKeeperError = {
  detail: string
}

type GenKeeperResponse = {
  query: string,
  prediction: boolean
}

export class Subtitles {
  constructor (subtitles: YoutubeSubtitle[] = []) {
    this.subtitles = subtitles.sort((a, b) => a.start() - b.start());
  }

  public static parse(subtitles: Subtitle[]): Subtitles {
    return new Subtitles(subtitles.map((s) => YoutubeSubtitle.parse(s)).filter((s) => s != null).map((s) => s as YoutubeSubtitle)).correctOverlapping();
  }

  public correctOverlapping(): Subtitles {
    const subtitles = [];

    for (let i = 0; i < this.subtitles.length - 1; i++) {
      let nextStart = this.subtitles[i + 1].start();
      subtitles.push(
        new YoutubeSubtitle(
          this.subtitles[i].start(),
          this.subtitles[i].end() > nextStart ? nextStart - this.subtitles[i].start() : this.subtitles[i].duration(),
          this.subtitles[i].textContent()
        )
      );
    }

    return new Subtitles(subtitles);
  }

  public batch(time_secs: number): Subtitles {
    if (this.subtitles.length === 1)
      return new Subtitles(this.subtitles);

    let subtitles = [];
    let batch_start = 0;

    for (let i = 1; i < this.subtitles.length; i++) {
      const dif = Math.abs(time_secs - (this.subtitles.slice(batch_start, i + 1).reduce((sum, current) => sum + current.duration(), 0)));
      const closest_dif = Math.abs(time_secs - (this.subtitles.slice(batch_start, i).reduce((sum, current) => sum + current.duration(), 0)));

      if (closest_dif < dif) {
        subtitles.push(YoutubeSubtitle.concat(this.subtitles.slice(batch_start, i)));
        batch_start = i;
      }

      if (i === this.subtitles.length - 1) {
        subtitles.push(YoutubeSubtitle.concat(this.subtitles.slice(batch_start, i + 1)));
        break;
      }
    }

    return new Subtitles(subtitles);
  }

  public async filterAI(): Promise<Subtitles> {
    let subtitles = [];

    for (let i = 0; i < this.subtitles.length; i++) {
      try {
        let response = await axios.get<GenKeeperResponse>(`${genKeeperAddress}/v1/predict/${this.subtitles[i].textContent()}`);
        
        if (response.data.prediction) {
          subtitles.push(this.subtitles[i])
        }
      } catch (error) {
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

  public maxRandom(maxDuration: number): Subtitles {
    let bestSubset: YoutubeSubtitle[] = [];
    let bestDuration = 0;
  
    const subsets = (subtitles: YoutubeSubtitle[], index: number, currentSubset: YoutubeSubtitle[], currentDuration: number) => {
      if (currentDuration <= maxDuration && currentDuration > bestDuration) {
        bestSubset = [...currentSubset];
        bestDuration = currentDuration;
      }
  
      if (index === subtitles.length || currentDuration >= maxDuration) {
        return;
      }
  
      subsets(subtitles, index + 1, currentSubset, currentDuration);
  
      currentSubset.push(subtitles[index]);
      subsets(subtitles, index + 1, currentSubset, currentDuration + subtitles[index].duration());
      currentSubset.pop();
    };
  
    subsets(this.subtitles, 0, [], 0);
    return new Subtitles(bestSubset);
  }

  public limit(limit: number): Subtitles {
    return new Subtitles(this.subtitles.slice(0, limit));
  }

  subtitles: YoutubeSubtitle[]; 
}