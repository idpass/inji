import { useSelector } from '@xstate/react';
import { useContext } from 'react';
import { selectServiceURL, SettingsEvents } from '../../machines/settings';
import { GlobalContext } from '../../shared/GlobalContext';

export function useDeveloperSetting() {
  const { appService } = useContext(GlobalContext);
  const settingsService = appService.children.get('settings');

  return {
    serviceURL: useSelector(settingsService, selectServiceURL),

    UPDATE_SERVICE_URL: (url: string) => {
      settingsService.send(SettingsEvents.UPDATE_SERVICE_URL(url));
    },
  };
}
