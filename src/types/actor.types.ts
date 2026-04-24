export interface FilmographyMovie {
  id: number;
  title: string;
  poster: string;
  year: number;
  character: string;
  rating?: number;
}

export interface Actor {
  id: number;
  name: string;
  biography?: string;
  profilePath?: string;
  birthdate?: string;
  birthplace?: string;
  knownForDepartment?: string;
  movies?: FilmographyMovie[];
}
