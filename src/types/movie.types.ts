export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster: string;
  backdrop: string;
  releaseDate: string;
  year: number;
  rating: number;
  genres: Genre[];
  language: string;
  cast?: CastMember[];
  trailer?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath?: string;
}
