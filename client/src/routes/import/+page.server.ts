import { fail, type RequestEvent } from '@sveltejs/kit';
import { YoutubeLink, ParseError, APIError } from './link';

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
  
      const subtitles = await youtubeLink.fetchCaptions();
      const sorted_subtitles = await subtitles.filterAI();
      
      
      return { error: false, videos: [] };
    } catch (error) {
      return fail(500, {
        error: true,
        message: "unknown internal error",
      });
    }
  }
};