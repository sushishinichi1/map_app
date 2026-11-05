import { useCallback, useEffect, useState } from 'react';

import {
  createSpot as insertSpot,
  deleteSpot as removeSpot,
  getAllSpots,
  updateSpot as persistSpot,
} from '@/repositories/spot-repository';
import type { CreateSpotInput, Spot, UpdateSpotInput } from '@/types/spot';

export function useSpots() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      setSpots(await getAllSpots());
    } catch {
      setError('保存したスポットを読み込めませんでした。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(reload);
  }, [reload]);

  const createSpot = useCallback(async (input: CreateSpotInput) => {
    setIsMutating(true);
    setError(null);
    try {
      const created = await insertSpot(input);
      setSpots((current) => [created, ...current]);
      return created;
    } catch {
      setError('スポットを保存できませんでした。');
      return null;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const updateSpot = useCallback(async (id: number, input: UpdateSpotInput) => {
    setIsMutating(true);
    setError(null);
    try {
      const updated = await persistSpot(id, input);
      if (!updated) throw new Error('Spot not found');
      setSpots((current) => current.map((spot) => (spot.id === id ? updated : spot)));
      return updated;
    } catch {
      setError('スポットを更新できませんでした。');
      return null;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const deleteSpot = useCallback(async (id: number) => {
    setIsMutating(true);
    setError(null);
    try {
      if (!(await removeSpot(id))) throw new Error('Spot not found');
      setSpots((current) => current.filter((spot) => spot.id !== id));
      return true;
    } catch {
      setError('スポットを削除できませんでした。');
      return false;
    } finally {
      setIsMutating(false);
    }
  }, []);

  return { spots, isLoading, isMutating, error, clearError: () => setError(null), reload, createSpot, updateSpot, deleteSpot };
}
