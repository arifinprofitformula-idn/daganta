import type { StorageAdapter } from './index';

export const placeholderStorageAdapter: StorageAdapter = {
  provider: 'local',
  isAvailable() {
    return false;
  },
};
