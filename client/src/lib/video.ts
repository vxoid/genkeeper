import type { YoutubeSubtitle } from './subtitle';
import { Subtitles } from './subtitles';
import ffmpeg from 'fluent-ffmpeg';
import { File } from './file';
import * as path from 'path';

const chopVideoToFile = (subtitle: YoutubeSubtitle, inputVideoPath: string, inputAudioPath: string, outputVideo: File) => {
  return new Promise<void>((resolve, reject) => {
    let stream = outputVideo.createWriteStream();
    stream.end();

    ffmpeg()
      .input(inputVideoPath)
      .input(inputAudioPath)
      .setStartTime(subtitle.start())
      .setDuration(subtitle.duration())
      .outputOptions('-c:v', 'copy')
      .outputOptions('-c:a', 'copy')
      .outputOptions('-map', '0:v:0')
      .outputOptions('-map', '1:a:0')
      .output(outputVideo.getPath())
      .on('end', resolve)
      .on('error', err => {
        outputVideo.delete();
        reject(err);
      })
      .run();

    console.log(`ffmpeg -i ${inputVideoPath} -i ${inputAudioPath} -ss ${subtitle.start()} -t ${subtitle.duration()} -c:v copy -c:a copy -map 0:v:0 -map 1:a:0 ${outputVideo.getPath()}`);
  });
}

const trimVideo = async (inputVideo: string, inputAudio: string, outputFile: string, subtitles: Subtitles, outputDir: string, name: string): Promise<File> => {
  const output = new File(outputFile);
  const chopFiles = subtitles.subtitles.map((_, i) => new File(path.join(outputDir, `${name}_${i}${path.extname(inputVideo)}`)));
  const promises: Promise<void>[] = subtitles.subtitles.map((subtitle, i) => chopVideoToFile(subtitle, inputVideo, inputAudio, chopFiles[i]));
  await Promise.all(promises);

  const concatFile = new File(path.join(outputDir, `${name}_concat_list.txt`));
  await new Promise<void>((resolve, reject) => {
    const stream = concatFile.createWriteStream();

    stream.on('error', reject);

    chopFiles.forEach((file) => {
      stream.write(`file '${file.getPath()}'\n`);
    });
    
    stream.end(() => {
      resolve();
    });
  });

  let stream = output.createWriteStream();
  stream.end();
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatFile.getPath())
      .inputOptions('-f', 'concat', '-safe', '0')
      .outputOptions('-c', 'copy')
      .output(output.getPath())
      .on('end', () => {
        chopFiles.map((file) => file.delete());
        concatFile.delete();
        resolve(output);
      })
      .on('error', (err) => {
        chopFiles.map((file) => file.delete());
        concatFile.delete();
        output.delete();
        reject(err);
      })
      .run();
  });
}

export class YoutubeVideo {
  constructor(protected id: string, videoPath: string, audioPath: string) {
    this.video = new File(videoPath);
    this.audio = new File(audioPath);
  }
  
  public async chop(subtitles: Subtitles, outputFile: string, outputDir: string = path.dirname(outputFile), name: string = "output"): Promise<File> {
    return trimVideo(this.video.getPath(), this.audio.getPath(), outputFile, subtitles, outputDir, name);
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
    return this.audio.createWriteStream();
  }

  public async delete() {
    await this.video.delete();
    await this.audio.delete();
  }

  video: File;
  audio: File;
}
