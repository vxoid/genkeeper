import PocketBase, { type RecordModel } from 'pocketbase';
import { fail, type RequestEvent } from '@sveltejs/kit';
import { YoutubeLink, ParseError } from '$lib/link';
import { tempStorage } from '$lib/dotenv.js';
import { PBHost } from '$lib/pocketbase.js';
import { Folder } from '$lib/folder.js';
import * as path from 'path';

const test_user_id = 'v77oicktyx5f5im';

class VideoRequest {
  constructor (private pb: PocketBase, private request: RecordModel) {}

  public async handle() {
    const youtubeLink = new YoutubeLink(this.request.vid);

    try {
      const tempFile = new Folder(tempStorage);
      if (!await tempFile.exists()) {
        tempFile.create();
      }

      const videoProcess = youtubeLink.download().catch(async (err) => await this.fail(err));
      const subtitles = await youtubeLink.fetchCaptions().catch(async (err) => await this.fail(err));
      if (!subtitles)
        return;
      const batchedSubtitles = subtitles.batch(20);
      const filteredSubtitles = (await batchedSubtitles.filterAI().catch(async (err) => await this.fail(err)));
      if (!filteredSubtitles)
        return;
      
      const timecodes = filteredSubtitles.maxRandom(60);
      
      const video = await videoProcess;
      if (!video)
        return;

      let resultVideo = await video.chop(timecodes, path.join(tempStorage, `${this.request.id}.mp4`)).catch(async (err) => await this.fail(err));
      if (!resultVideo)
        return;
      
      // video.delete();
  
      const formData = new FormData();
      resultVideo.buffer()
      const resultVideoBuffer = await resultVideo.buffer().catch(async (err) => await this.fail(err));
      if (!resultVideoBuffer)
        return;

      formData.append("result", new Blob([resultVideoBuffer]), `${this.request.id}.mp4`);
      formData.append("status", "succeeded");
      
      await this.pb.collection('requests').update(this.request.id, formData).catch(async (err) => await this.fail(err));
      
      resultVideo.delete();
    } catch (err) {await this.fail(err)};
  }

  private async fail(err: unknown) {
    console.log(`internal err: ${err}`);
    await this.pb.collection('requests').update(this.request.id, { 
      "status": "failed",
      "message": "unknown internal error" 
    });
  }
}

/** @type {import('./$types').Actions} */
export const actions = {
	import: async (event: RequestEvent) => {
    try {
      const data = await event.request.formData();
      const link = data.get("link");
      const formToken = data.get("token");
      
      if (!link) {
        return fail(400, {
          error: true,
          message: "no link passed.",
        });
      }

      if (!formToken) {
        return fail(400, {
          error: true,
          message: "no user token passed.",
        });
      }
  
      const stringLink = link.toString();
      const token = formToken.toString();

      const youtubeLink = YoutubeLink.parseLink(stringLink);
      if (youtubeLink instanceof ParseError) {
        return fail(400, {
          error: true,
          message: youtubeLink.msg,
        });
      }

      const pb = new PocketBase(PBHost);
      pb.authStore.save(token);
      
      const test_user = await pb.collection('users').getOne(test_user_id);
      const request = await pb.collection('requests').create({ 
        owner: test_user.id,
        status: "processing",
        vid: youtubeLink.id        
      }).catch((error) => { 
        if (error.status === 400) {
          return null;
        }

        throw error;
      });

      if (!request) {
        return fail(403, {
          error: true,
          message: "you cant access this user",
        });
      }

      const vidRequest = new VideoRequest(pb, request);
      vidRequest.handle();

      return { error: false, request: request.id };
    } catch (error) {
      console.log(`internal err: ${error}`);
      return fail(500, {
        error: true,
        message: "unknown internal error",
      });
    }
  }
};