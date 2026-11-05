export type Spot = {
  id: number;
  name: string;
  note: string;
  latitude: number;
  longitude: number;
  createdAt: string;
};

export type CreateSpotInput = Omit<Spot, 'id' | 'createdAt'>;

export type UpdateSpotInput = Pick<Spot, 'name' | 'note' | 'latitude' | 'longitude'>;
