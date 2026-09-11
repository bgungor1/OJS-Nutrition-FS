export interface Country {
  id: number;
  name: string;
}

export interface Region {
  id: number;
  name: string;
  country_id: number;
}

export interface Subregion {
  id: number;
  name: string;
  region_id: number;
}
