export interface Cinema {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  phoneNumber?: number;
  countryCode?: number;
}


export interface CinemaSearchResponse {
  cinemas: Cinema[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
