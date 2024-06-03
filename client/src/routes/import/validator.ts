const youtubeStandartRegex: RegExp = /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=([^&=%\?]{11})(&.*)?$/;
const youtubeShortRegex: RegExp = /^(https?:\/\/)?(www\.)?youtu\.be\/([^&=%\?]{11})(&.*)?$/;
const youtubeEmbedRegex: RegExp = /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/([^&=%\?]{11})(&.*)?$/;
const youtubeShortEmbedRegex: RegExp = /^(https?:\/\/)?(www\.)?youtube\.com\/v\/([^&=%\?]{11})(&.*)?$/;

export function isYoutubeVideoLink(link: string): boolean {
  return youtubeStandartRegex.test(link) || youtubeShortRegex.test(link) || youtubeEmbedRegex.test(link) || youtubeShortEmbedRegex.test(link);
}