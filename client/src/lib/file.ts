import { Writable } from 'stream';
import * as fs from 'fs';

export class File {
  constructor(protected filePath: string) {}

  public async exists(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      fs.stat(this.filePath, (err, stats) => {
        if (err) {
          if (err.code === 'ENOENT') {
            resolve(false);
            return;
          } else {
            reject(err);
            return;
          }
        }
        
        resolve(stats.isFile());
      });
    });
  }

  public getPath(): string {
    return this.filePath;
  }

  public async buffer(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      fs.readFile(this.getPath(), (err, data) => {
        if (err)
          reject(err);

        resolve(data);
      });
    });
  }

  public createWriteStream(): Writable {
    return fs.createWriteStream(this.getPath());
  }

  public async delete() {
    await fs.unlink(this.getPath(), (err) => { if (err) throw err; });
  }
}