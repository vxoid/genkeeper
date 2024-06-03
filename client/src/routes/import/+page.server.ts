import { fail, type RequestEvent } from '@sveltejs/kit';
import { isYoutubeVideoLink } from './validator';

/** @type {import('./$types').Actions} */
export const actions = {
	import: async (event: RequestEvent) => {
    const data = await event.request.formData();
    const link = data.get("link");
  
    if (!link) {
      return fail(400, {
        error: true,
        message: "there was no link passed.",
      });
    }

    const stringLink = link.toString();

    if (!isYoutubeVideoLink(stringLink)) {
      return fail(400, {
        error: true,
        message: `cannot parse ${stringLink} as a valid youtube link.`,
      });
    }

    return { error: false, videos: [] };
  }
};