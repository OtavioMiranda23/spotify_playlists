export default class Youtube {
  private music: string
  private artist: string[];
  private album: string;
  private searchUrl: string = "";
  private baseYoutubeSearchUrl = "https://www.youtube.com/results?search_query=";
  private baseGoogleSearchUrl = "https://www.google.com/search?q=";

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

  public createSearchYoutubeUrl(): void {
    const artist = this.artist.toString().replaceAll(" ", "+").replaceAll(",", "+");
    const album = this.album.replaceAll(" ", "+");
    const music = this.music.replaceAll(" ", "+");
    this.searchUrl = `${this.baseYoutubeSearchUrl}+${music}+${artist}+${album}`;
  };

  public createSearchGoogleUrl(): void {
    const artist = this.artist.toString().replaceAll(" ", "+").replaceAll(",", "+");
    const album = this.album.replaceAll(" ", "+");
    const music = this.music.replaceAll(" ", "+");
    this.searchUrl = `${this.baseGoogleSearchUrl}+${music}+${artist}+${album}&tbm=vid`;
  };
  public createSearchGoogleUrlWithoutAlbum(): void {
    const artist = this.artist.toString().replaceAll(" ", "+").replaceAll(",", "+");
    const music = this.music.replaceAll(" ", "+");
    this.searchUrl = `${this.baseGoogleSearchUrl}+${music}+${artist}&tbm=vid`;
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