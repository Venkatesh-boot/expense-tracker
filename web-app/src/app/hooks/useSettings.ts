import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchSettingsStart } from '../store/slices/settingsSlice';

/**
 * Custom hook to handle settings fetching
 * Only fetches settings if they haven't been fetched before
 */
export const useSettings = (autoFetch = true) => {
  const dispatch = useDispatch();
  const { settings, loading, error, hasFetched } = useSelector((state: RootState) => state.settings);

  useEffect(() => {
    // Only fetch settings if they haven't been fetched before and not currently loading
    if (autoFetch && !hasFetched && !loading) {
      dispatch(fetchSettingsStart());
    }
  }, [dispatch, hasFetched, loading, autoFetch]);

  return {
    settings,
    loading,
    error,
    hasFetched,
  };
};

/**
 * Hook to just read settings without triggering a fetch
 * Use this in components that only need to read currency/settings
 */
export const useSettingsData = () => {
  const { settings } = useSelector((state: RootState) => state.settings);
  return {
    settings,
    currency: settings?.currency || 'INR',
  };
};
