import CreateYoutubeLinkParallelWithDuck from "../usecase/CreateYoutubeLinksParallelWithDuck";
import CreateYoutubeLinkParallelWithBing from "../usecase/CreateYoutubeLinkParallelWithBrave";
import CreateYoutubeLinksParallelWithGoogle, { Output } from "../usecase/CreateYoutubeLinksParallelWithGoogle";

export function CreateLinkFactory(youtubeLinks: any, counter: number): Promise<Output[] | undefined> {
  console.log(counter);
  
  if (counter === 1) return new CreateYoutubeLinksParallelWithGoogle(youtubeLinks).execute();
  if (counter === 2) return new CreateYoutubeLinkParallelWithDuck(youtubeLinks).execute();
  return new CreateYoutubeLinkParallelWithBing(youtubeLinks).execute();
};