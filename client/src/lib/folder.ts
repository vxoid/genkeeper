import { Writable } from 'stream';
import * as fs from 'fs';

export class Folder {
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
        
        resolve(stats.isDirectory());
      });
    });
  }

  public getPath(): string {
    return this.filePath;
  }

  public async create(): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.mkdir(this.filePath, { recursive: true }, (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  public async delete(): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.rmdir(this.filePath, (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }
}