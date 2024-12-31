export default class Youtube {
  private music: string
  private artist: string[];
  private album: string;
  private searchUrl: string = "";
  private musicUrl: string = "https://www.youtube.com";
  private baseSearchUrl = "https://www.youtube.com/results?search_query=";

  constructor(music: string, artist: string[], album: string) {
    if (!music) throw new Error("Music não encontradada");
    this.music = music;
    if (!artist) throw new Error("Artist não encontrado");
    this.artist = artist;
    if (!album) throw new Error("Album não encontrado");
    this.album = album;    
  };

  public createSearchUrl(): void {
    const artist = this.artist.toString().replaceAll(" ", "+").replaceAll(",", "+");
    const album = this.album.replaceAll(" ", "+");
    const music = this.music.replaceAll(" ", "+");
    this.searchUrl = `${this.baseSearchUrl}+${music}+${artist}+${album}`;
  };

  public getSearchUrl() {
    if (!this.searchUrl) throw new Error("SearchUrl inválida");
    return this.searchUrl;
  };

  public createMusicUrl(url: string): string {
    if (!url) throw new Error("Url inválida");
    return this.musicUrl + url;
  };
};