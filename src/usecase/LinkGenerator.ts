import { Output } from "./CreateYoutubeLinkParallel";

export default interface LinkGenerator {
  execute(musicInfos: any): Promise<Output[]>;
}