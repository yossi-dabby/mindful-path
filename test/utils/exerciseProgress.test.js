import { describe, expect, it, vi } from 'vitest';
import {
  installExerciseProgressAdapter,
  isExerciseProgressUpdate,
  mergeExerciseProgress,
} from '../../src/lib/exerciseProgress.js';

describe('per-user exercise progress', () => {
  it('removes legacy shared state and merges only owner-scoped progress', () => {
    const exercises = [{
      id: 'exercise-1',
      title: 'Grounding',
      favorite: true,
      completed_count: 99,
      total_time_practiced: 999,
    }];
    const progress = [{
      exercise_id: 'exercise-1',
      favorite: true,
      completed_count: 2,
      total_time_practiced: 10,
      last_completed: '2026-08-31T10:00:00.000Z',
    }];

    expect(mergeExerciseProgress(exercises, progress)).toEqual([{
      ...exercises[0],
      favorite: true,
      completed_count: 2,
      total_time_practiced: 10,
      last_completed: '2026-08-31T10:00:00.000Z',
    }]);
    expect(mergeExerciseProgress(exercises, [])[0]).toMatchObject({
      favorite: false,
      completed_count: 0,
      total_time_practiced: 0,
      last_completed: null,
    });
  });

  it('recognizes progress-only updates', () => {
    expect(isExerciseProgressUpdate({ favorite: true })).toBe(true);
    expect(isExerciseProgressUpdate({ completed_count: 2, total_time_practiced: 10 })).toBe(true);
    expect(isExerciseProgressUpdate({ title: 'Changed' })).toBe(false);
  });

  it('routes progress updates to UserExerciseProgress and preserves admin catalog updates', async () => {
    const originalCatalogUpdate = vi.fn().mockResolvedValue({ id: 'exercise-1' });
    const progressCreate = vi.fn().mockResolvedValue({ id: 'progress-1' });
    const base44 = {
      entities: {
        Exercise: {
          list: vi.fn().mockResolvedValue([{ id: 'exercise-1', favorite: true }]),
          filter: vi.fn().mockResolvedValue([{ id: 'exercise-1', favorite: true }]),
          update: originalCatalogUpdate,
        },
        UserExerciseProgress: {
          list: vi.fn().mockResolvedValue([]),
          filter: vi.fn().mockResolvedValue([]),
          create: progressCreate,
          update: vi.fn(),
        },
      },
    };

    installExerciseProgressAdapter(base44);
    expect(await base44.entities.Exercise.list()).toEqual([{
      id: 'exercise-1',
      favorite: false,
      completed_count: 0,
      last_completed: null,
      total_time_practiced: 0,
    }]);

    await base44.entities.Exercise.update('exercise-1', { favorite: true });
    expect(progressCreate).toHaveBeenCalledWith({ exercise_id: 'exercise-1', favorite: true });
    expect(originalCatalogUpdate).not.toHaveBeenCalled();

    await base44.entities.Exercise.update('exercise-1', { title: 'Admin edit' });
    expect(originalCatalogUpdate).toHaveBeenCalledWith('exercise-1', { title: 'Admin edit' });
  });
});
