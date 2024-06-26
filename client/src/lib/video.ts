import { Subtitles } from './subtitles';
import ffmpeg from 'fluent-ffmpeg';
import { File } from './file';

const chopVideoToFile = (inputFile: string, inputAudio: string, outputFile: string, subtitles: Subtitles): Promise<File> => {
  return new Promise((resolve, reject) => {
    let file = new File(outputFile);
    const filterComplex = subtitles.subtitles
      .map((subtitle, index: number) => {
        return `[0:v]trim=start=${subtitle.start()}:duration=${subtitle.duration()},setpts=PTS-STARTPTS[v${index}];` +
              `[0:a]atrim=start=${subtitle.start()}:duration=${subtitle.duration()},asetpts=PTS-STARTPTS[a${index}]`;
      })
      .join(';');

    const concatInputs = subtitles.subtitles
      .map((_, index) => `[v${index}][a${index}]`)
      .join('');

    ffmpeg()
      .input(inputFile)
      .input(inputAudio)
      .outputOptions('-filter_complex', `${filterComplex};${concatInputs}concat=n=${subtitles.subtitles.length}:v=1:a=1[v][a]`)
      .outputOptions('-map', '[v]')
      .outputOptions('-map', '[a]')
      .output(outputFile)
      .on('end', () => {
        resolve(file);
      })
      .on('error', reject)
      .run();
  });
};

export class YoutubeVideo {
  constructor(protected id: string, videoPath: string, audioPath: string) {
    this.video = new File(videoPath);
    this.audio = new File(audioPath);
  }
  
  public async chop(subtitles: Subtitles, outputFile: string): Promise<File> {
    return chopVideoToFile(this.video.getPath(), this.audio.getPath(), outputFile, subtitles);
  }

  public async exists(): Promise<boolean> {
    const vidExists = this.video.exists();
    const audExists = this.audio.exists();
    return await vidExists && await audExists;
  }

  public async createVidWriteStream() {
    return this.video.createWriteStream();
  }

  public async createAudWriteStream() {
    return this.video.createWriteStream();
  }

  public async delete() {
    await this.video.delete();
    await this.audio.delete();
  }

  video: File;
  audio: File;
}
