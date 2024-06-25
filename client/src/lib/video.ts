import { Subtitles } from './subtitles';
import ffmpeg from 'fluent-ffmpeg';
import { File } from './file';

const chopVideoToBuffer = (inputFile: string, outputFile: string, subtitles: Subtitles): Promise<File> => {
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

    ffmpeg(inputFile)
      .outputOptions('-filter_complex', `${filterComplex};${concatInputs}concat=n=${subtitles.subtitles.length}:v=1:a=1[v][a]`)
      .outputOptions('-map', '[v]')
      .outputOptions('-map', '[a]')
      .output(outputFile)
      .on('end', () => {
        resolve(file);
      })
      .on('error', (err) => {
        console.log(`throwing error: ${err}`);
        reject(err);
      })
      .run();
  });
};

export class YoutubeVideo extends File {
  public async chop(subtitles: Subtitles, outputFile: string): Promise<File> {
    return chopVideoToBuffer(this.getPath(), outputFile, subtitles);
  }
}