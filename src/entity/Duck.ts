export default class Duck {
  private music: string
  private artist: string[];
  private album: string;
  private searchUrl: string = "";
  private baseDuckSearchUrl = "https://html.duckduckgo.com/html?q=youtube+";
  constructor(music: string, artist: string[], album: string) {
    if (!music) throw new Error("Music não encontradada");
    this.music = music;
    if (!artist) throw new Error("Artist não encontrado");
    this.artist = artist;
    if (!album) {     
      this.album = "";
      return;
    };
    this.album = album;    
  };

  public createSearchDuckUrl(): void {
    const artist = this.artist.toString().replaceAll(" ", "%20").replaceAll(",", "%20");
    const album = this.album.replaceAll(" ", "%20");
    const music = this.music.replaceAll(" ", "%20");
    this.searchUrl = `${this.baseDuckSearchUrl}%20${music}%20${artist}%20${album}`;
  };

  public createSearchDuckUrlWithoutAlbum(): void {
    const artist = this.artist.toString().replaceAll(" ", "%20").replaceAll(",", "%20");
    const music = this.music.replaceAll(" ", "%20");
    this.searchUrl = `${this.baseDuckSearchUrl}%20${music}%20${artist}`;
  };
  public getSearchUrl() {
    if (!this.searchUrl) throw new Error("SearchUrl inválida");
    return this.searchUrl;
  };

  public createMusicUrl(id: string): string {
    if (!id) throw new Error("Id inválido");
    return `https://www.youtube.com/watch?v=${id}`;
  };

  public getMusicName() {
    return this.music;
  }
};