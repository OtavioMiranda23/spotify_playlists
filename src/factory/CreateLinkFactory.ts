import CreateYoutubeLinksAxios from "../usecase/CreateYoutubeLinkAxios";
import CreateYoutubeLinksParallel, { Output } from "../usecase/CreateYoutubeLinkParallel";

export function CreateLinkFactory(youtubeLinks: any): Promise<Output[]> {
  if (youtubeLinks.length > 20) return new CreateYoutubeLinksParallel().execute(youtubeLinks);
  return new CreateYoutubeLinksAxios().execute(youtubeLinks);
};