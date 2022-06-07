import { ContextFrom, EventFrom, send, StateFrom } from 'xstate';
import { createModel } from 'xstate/lib/model';
import { AppServices } from '../shared/GlobalContext';
import { SETTINGS_STORE_KEY } from '../shared/constants';
import { VCLabel } from '../types/vc';
import { StoreEvents } from './store';
import { log } from 'xstate/lib/actions';

const model = createModel(
  {
    serviceRefs: {} as AppServices,
    name: '',
    vcLabel: {
      singular: 'ID',
      plural: 'IDs',
    } as VCLabel,
    isBiometricUnlockEnabled: false,
    serviceURL: 'https://resident-app.newlogic.dev',
  },
  {
    events: {
      UPDATE_NAME: (name: string) => ({ name }),
      UPDATE_SERVICE_URL: (url: string) => ({ url }),
      UPDATE_VC_LABEL: (label: string) => ({ label }),
      TOGGLE_BIOMETRIC_UNLOCK: (enable: boolean) => ({ enable }),
      STORE_RESPONSE: (response: unknown) => ({ response }),
      CHANGE_LANGUAGE: (language: string) => ({ language }),
    },
  }
);

export const SettingsEvents = model.events;

export const settingsMachine = model.createMachine(
  {
    tsTypes: {} as import('./settings.typegen').Typegen0,
    schema: {
      context: model.initialContext,
      events: {} as EventFrom<typeof model>,
    },
    id: 'settings',
    initial: 'init',
    states: {
      init: {
        entry: ['requestStoredContext'],
        on: {
          STORE_RESPONSE: [
            { cond: 'hasData', target: 'idle', actions: ['setContext'] },
            { target: 'storingDefaults' },
          ],
        },
      },
      storingDefaults: {
        entry: ['storeContext'],
        on: {
          STORE_RESPONSE: 'idle',
        },
      },
      idle: {
        on: {
          TOGGLE_BIOMETRIC_UNLOCK: {
            actions: ['toggleBiometricUnlock', 'storeContext'],
          },
          UPDATE_NAME: {
            actions: ['updateName', 'storeContext'],
          },
          UPDATE_VC_LABEL: {
            actions: ['updateVcLabel', 'storeContext'],
          },
          UPDATE_SERVICE_URL: {
            actions: [
              log('UPDATE_SERVICE_URL received'),
              'updateServiceURL',
              'storeContext',
            ],
          },
        },
      },
    },
  },
  {
    actions: {
      requestStoredContext: send(StoreEvents.GET(SETTINGS_STORE_KEY), {
        to: (context) => context.serviceRefs.store,
      }),

      storeContext: send(
        (context) => {
          const { serviceRefs, ...data } = context;
          return StoreEvents.SET(SETTINGS_STORE_KEY, data);
        },
        { to: (context) => context.serviceRefs.store }
      ),

      setContext: model.assign((context, event) => {
        const newContext = event.response as ContextFrom<typeof model>;
        return {
          ...context,
          ...newContext,
        };
      }),

      updateName: model.assign({
        name: (_, event) => event.name,
      }),

      updateServiceURL: model.assign({
        serviceURL: (_, event) => event.url,
      }),

      updateVcLabel: model.assign({
        vcLabel: (_, event) => ({
          singular: event.label,
          plural: event.label + 's',
        }),
      }),

      toggleBiometricUnlock: model.assign({
        isBiometricUnlockEnabled: (_, event) => event.enable,
      }),
    },

    services: {},

    guards: {
      hasData: (_, event) => event.response != null,
    },
  }
);

export function createSettingsMachine(serviceRefs: AppServices) {
  return settingsMachine.withContext({
    ...settingsMachine.context,
    serviceRefs,
  });
}

type State = StateFrom<typeof settingsMachine>;

export function selectName(state: State) {
  return state.context.name;
}

export function selectVcLabel(state: State) {
  return state.context.vcLabel;
}

export function selectBiometricUnlockEnabled(state: State) {
  return state.context.isBiometricUnlockEnabled;
}

export function selectServiceURL(state: State) {
  return state.context.serviceURL;
}
