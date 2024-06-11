import PocketBase, { type RecordModel } from 'pocketbase';
import { fail, type RequestEvent } from '@sveltejs/kit';
import { YoutubeLink, ParseError } from '$lib/link';
import { PBHost } from '$lib/pocketbase.js';

const test_user_id = 'b34m5czzv4gz1ow';

async function handleRequest(pb: PocketBase, request: RecordModel) {
  const youtubeLink = new YoutubeLink(request.vid);

  try {
    const videoProcess = youtubeLink.download();
    const subtitles = await youtubeLink.fetchCaptions();
    const sorted_subtitles = await subtitles.filterAI();
    const video = await videoProcess;

    video.delete();
    
    await pb.collection('requests').update(request.id, { 
      "status": "succeeded"
    });
  } catch (error) {
    console.log(`internal err: ${error}`);
    await pb.collection('requests').update(request.id, { 
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
      
      if (!link) {
        return fail(400, {
          error: true,
          message: "no link passed.",
        });
      }
  
      const stringLink = link.toString();
      
      const youtubeLink = YoutubeLink.parseLink(stringLink);
      if (youtubeLink instanceof ParseError) {
        return fail(400, {
          error: true,
          message: youtubeLink.msg,
        });
      }

      const pb = new PocketBase(PBHost);
      const test_user = await pb.collection('users').getOne(test_user_id);
      
      pb.authStore.save("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2xsZWN0aW9uSWQiOiJfcGJfdXNlcnNfYXV0aF8iLCJleHAiOjE3MTkxNTQ4NzUsImlkIjoiYjM0bTVjenp2NGd6MW93IiwidHlwZSI6ImF1dGhSZWNvcmQifQ.S8w5Y0JLBaSiK4bEZU6SwRgpcHNDFg-vubrN8Ax_txM", test_user);
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

      handleRequest(pb, request);

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