import { musicInfos, Output } from "./CreateYoutubeLinksParallelWithGoogle";

export default interface LinkGenerator {
  execute(musicInfos: musicInfos[]): Promise<Output[] | undefined>;
}