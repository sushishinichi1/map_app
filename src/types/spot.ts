export type Spot = {
  id: number;
  name: string;
  note: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  photoUri: string | null;
};

export type CreateSpotInput = Omit<Spot, 'id' | 'createdAt' | 'photoUri'>;

export type UpdateSpotInput = Pick<Spot, 'name' | 'note' | 'latitude' | 'longitude'>;
