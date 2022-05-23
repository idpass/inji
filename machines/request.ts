import SmartShare from '@idpass/smartshare-react-native';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import { EmitterSubscription } from 'react-native';
import { assign, EventFrom, send, sendParent, StateFrom } from 'xstate';
import { createModel } from 'xstate/lib/model';
import { DeviceInfo } from '../components/DeviceInfoList';
import { Message } from '../shared/Message';
import { getDeviceNameSync } from 'react-native-device-info';
import { StoreEvents } from './store';
import { VC } from '../types/vc';
import { AppServices } from '../shared/GlobalContext';
import { RECEIVED_VCS_STORE_KEY, VC_ITEM_STORE_KEY } from '../shared/constants';
import { ActivityLogEvents } from './activityLog';
import { VcEvents } from './vc';

const model = createModel(
  {
    serviceRefs: {} as AppServices,
    senderInfo: {} as DeviceInfo,
    receiverInfo: {} as DeviceInfo,
    incomingVc: {} as VC,
    connectionParams: '',
    loggers: [] as EmitterSubscription[],
  },
  {
    events: {
      ACCEPT: () => ({}),
      REJECT: () => ({}),
      CANCEL: () => ({}),
      DISMISS: () => ({}),
      VC_RECEIVED: (vc: VC) => ({ vc }),
      RESPONSE_SENT: () => ({}),
      CONNECTED: () => ({}),
      DISCONNECT: () => ({}),
      EXCHANGE_DONE: (senderInfo: DeviceInfo) => ({ senderInfo }),
      SCREEN_FOCUS: () => ({}),
      SCREEN_BLUR: () => ({}),
      BLUETOOTH_ENABLED: () => ({}),
      BLUETOOTH_DISABLED: () => ({}),
      STORE_READY: () => ({}),
      STORE_RESPONSE: (response: unknown) => ({ response }),
      RECEIVE_DEVICE_INFO: (info: DeviceInfo) => ({ info }),
      RECEIVED_VCS_UPDATED: () => ({}),
      VC_RESPONSE: (response: unknown) => ({ response }),
    },
  }
);

export const RequestEvents = model.events;

export const requestMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QCcwEcCucAuA6AxgBZj4DWAlgHZQBCANltgPZPaEDKYyAbufmAWJkqUAMQ0AMgFUAogBUA8grkAJAPoyAcgEFJMgCKJQAByaxy2ck0pGQAD0QBWACwAGXAHYAHAE4AjK4AbK4+gS6uAEwANCAAnk4RzrheAMwpzn7OHn4pLn6OAL4FMaiYOIIkFNT0jCxsnDx8AkSVIuLS8kqqavoAkuy6Ega2puaW1rYOCOGevgHBoeHRcYgpHkmp6ZnZuRmFxSClWLB4LcLVDGDMrBxcvPy4RzhtkrKKyupag8NIIKMWVhsvymAT8HlwzgWHkcEVSgUCXmW8QQKX8uEcrkxXhyXkirkRRRK6GOpyEVVol2u9TuTUexOe1Haby66j6Az0hl+-3GQNAIIySUx3kSfgijnWzhiyIiHgiuExWOyPhS+NcfkChMO9JOFXOFNqNwa9wEYEoAEMAEZ0SCiEZmAETYGITKZeWuYUZMUSqVOfLJNJuDzKvxecXOTVPHX4a1m5AiADC1koJB5ojsJzN2AEZoAZlnkAAKeNDbQAJR6Mgk2gAmgBKUSR04xuPUROUZP4Hl2saAybO9buUPqkKYiI+DyBPw+6Z+zaB4Oh9YR7V4ADuZoB1AAYkxkG2O6n4wpNJoZPG5D8TPau06EBlArgIiGJ85HCkn7jXI5pxEx4OA8EiQeB4X4pMuZQ6uum5QDue5JimgKiGyR4nmecjdg6vL2IgzgRA+H4vm+H6Yt+KwIE+qL+ukgFZCBb7gSSuDGKgxixiIchMDIdhEGa1BgL0lA5kwoilmeMi9AAajIFYSb08bSb0mhbgoGE3nyiCpEk3g5DkPh7D4v4-jKfi4Gk6QuM46SbBqByNrgYDcYQvFQCI+hgMaAlCaIMgABrxio2iaAA4tJ+jHjIqm9regRIogY6UQqfj5LCXgxV4DHlFBljbruEn4Eh-Qoae56RY66l3jCnihIujiTikqR6T+45JGZr7OJZzjWRlkEbtlMG5flEnxmoonyZJl5-NeUXlTCP4wnKrUWVZaQ2USEF4KgvBgKuIi4Ga+D8MYfV0utIiliQYDkNwkB5bAohDSNMjsAACse7ARVyU1ldhCDPo4ySIriETvusHiotOyobABkS0V++xrYxm3kNtu37Ydx2NiIXHkCcIh5aI7CKKJj0vW9H1Xj231TMDnWzD4eK5PCwGBBDPj-XOnUxX4oT5N1G3ucjO3UHtB1gEdu0ALZcC51ACfgTAS3j+WEwoxOiaTmjvaVWHU4iD7ePTf7Qj4qWs+zAac0+PPw1q610ltQtQCL6O7cxYumhAZ0XVdN3K0T0nq69mvk5NlM686XjQgDsKRCDWTg2RXjtVR7WpVbk423ZSMo8LaNi8dJy7krBP+yTQda59Yd9uRet05E9PG6bifJxzafcxnfP24LqOi0dNpsgAsv07Da9XmSBD4boeqKYaSmRmSIinjjJQ10Kd9njt0gAVim-f9EP7Aj5XmHV2krpBgiM9JTFLPz84JumQGzOpe+YLrwLOdiNo8byc96HH2pH6mR75T0RJ6We04gzglapbduvNbIri7p-ESMgABSaFR63mAZPIUYCZ7ennhEIIKduaOHFMEeBCNygbzaPGQK8kJCYPKtg0BIovTtWnElRwXgU4pCSnOMh78HZtGQseYq-8KYn2irFci7V-zURhsBUCndPawHlu2XeEACrsAPkfSRgCpj3kfM+QIr5X6flItKPEj9qLBGCOKJcCD1oE3jKJLQahXiliYT9XCnDfzogVJCDEY4JyUNtiSFxbjNBqGUvGKQejQ5SPKr4sikJ3DwkCOsXEkJI77AOJQJgEA4C2DslQfalhrreJBA-XwQRl75CDCKCGJkFSuDcBPNUbTIidzOOSGoVw6i3EaA8XpIgqlxVwo+DEap1TsMDNOLID4MnrF-OkUckcelkhEP0qkQzjQnRJGMgB00frGwhEEWE3MQIXxkekFINi3C1KCBPTOiDRkXANNSYZJpzRWkgOM36wN7lfnjgERYbgUjTgxJPTY9UwRg2VOkTZrQPkDMNDSfgAKPxTMxNfOZ7ofwgRscvXI74UhhD0p3K0nzCBuUoMjCAAL1TvlwDFSxcV4RukxJOVwuR8hsp6c2BM8FOwnO5CckEy9-rvmxGY18X4ZGdRagGSI-CTb0ScYxLKIhYL7gQt9cVVMNIeB-MleUmlcSOAMtCNemryhu1Yi2KAHEuI8T4p5JgALapJCVbhfI9dQlGStQ8panUVqdwcm6mWUA3IeUEp645RrfpfnSTKkCaVZSRCDZPRa7Vlrks7tqnKyA8pYshKZKVKoYQGV5ZHJqkzW5c2tkI7uwtyAQGtEy9qOD3R4LmdOUM0qAzkp8KEJ8jiqE6hobnXuGMVxe34D7CAt0mXBGBb22EnU3wmwhqYh5uFcT018K8u206nZ53FsLTG1Bsa42oKWxN4dyIhHub4JOIZgjYnhLu5V6QD0jmPS2z+zt86S2liIOWCslZYrfEkMFaRUovPviasioRf3tRjketmQHN4XuOg6j2C7LrXWXfgVdvL0R8KIffYJGQvADpyPuzD+JKV2qnR-XDs7dqFydQ+-REq4qin1tiX81bq3koY-cmBzHfDhjY-zYRM6XbUCZeKHtwok6hlRPRsiA5iVZDkd4K1OGe7o3+Y+0+ao5Twfjl4OzDiB3EIEXDNmoZVrhOoRx3aqAd6dnM-xpN-KfWZF7Vu7TnDgEpzFGsNpYM5OToU62p25peBQEzOxJgKgFZgFU4vS5eEVQGxipwxZUW3wgXjvFjz7HFNQC7WKVh4CCHImCL+lwEpe3Gfk7gVR6iDz+cSQYxArXWWmMUcyvhOnpRodwIi3CuFe2jr5kyqbw2uWZCIiGTEkIihFCAA */
  model.createMachine(
    {
      tsTypes: {} as import('./request.typegen').Typegen0,
      schema: {
        context: model.initialContext,
        events: {} as EventFrom<typeof model>,
      },
      id: 'request',
      initial: 'inactive',
      invoke: {
        src: 'checkConnection',
      },
      on: {
        SCREEN_BLUR: {
          target: '.inactive',
          internal: false,
        },
        SCREEN_FOCUS: {
          target: '.checkingBluetoothService',
          internal: false,
        },
      },
      states: {
        inactive: {
          entry: 'removeLoggers',
        },
        checkingBluetoothService: {
          initial: 'checking',
          states: {
            checking: {
              invoke: {
                src: 'checkBluetoothService',
              },
              on: {
                BLUETOOTH_ENABLED: {
                  target: 'enabled',
                },
                BLUETOOTH_DISABLED: {
                  target: 'requesting',
                },
              },
            },
            requesting: {
              invoke: {
                src: 'requestBluetooth',
              },
              on: {
                BLUETOOTH_ENABLED: {
                  target: 'enabled',
                },
                BLUETOOTH_DISABLED: {
                  target: '#request.bluetoothDenied',
                },
              },
            },
            enabled: {
              always: {
                target: '#request.clearingConnection',
              },
            },
          },
        },
        bluetoothDenied: {},
        clearingConnection: {
          entry: 'disconnect',
          after: {
            CLEAR_DELAY: {
              target: 'waitingForConnection',
            },
          },
        },
        waitingForConnection: {
          entry: [
            'removeLoggers',
            'registerLoggers',
            'generateConnectionParams',
          ],
          invoke: {
            src: 'advertiseDevice',
          },
          on: {
            CONNECTED: {
              target: 'preparingToExchangeInfo',
            },
            DISCONNECT: {
              target: 'disconnected',
            },
          },
        },
        preparingToExchangeInfo: {
          entry: 'requestReceiverInfo',
          on: {
            RECEIVE_DEVICE_INFO: {
              actions: 'setReceiverInfo',
              target: 'exchangingDeviceInfo',
            },
          },
        },
        exchangingDeviceInfo: {
          invoke: {
            src: 'exchangeDeviceInfo',
          },
          on: {
            EXCHANGE_DONE: {
              actions: 'setSenderInfo',
              target: 'waitingForVc',
            },
          },
        },
        waitingForVc: {
          invoke: {
            src: 'receiveVc',
          },
          on: {
            DISCONNECT: {
              target: 'disconnected',
            },
            VC_RECEIVED: {
              actions: 'setIncomingVc',
              target: 'reviewing',
            },
          },
        },
        reviewing: {
          exit: 'disconnect',
          initial: 'idle',
          states: {
            idle: {},
            accepting: {
              initial: 'requestingReceivedVcs',
              states: {
                requestingReceivedVcs: {
                  entry: 'requestReceivedVcs',
                  on: {
                    VC_RESPONSE: [
                      {
                        cond: 'hasExistingVc',
                        target: 'requestingExistingVc',
                      },
                      {
                        target: 'prependingReceivedVc',
                      },
                    ],
                  },
                },
                requestingExistingVc: {
                  entry: 'requestExistingVc',
                  on: {
                    STORE_RESPONSE: {
                      target: 'mergingIncomingVc',
                    },
                  },
                },
                mergingIncomingVc: {
                  entry: 'mergeIncomingVc',
                  on: {
                    STORE_RESPONSE: {
                      target: '#request.reviewing.accepted',
                    },
                  },
                },
                prependingReceivedVc: {
                  entry: 'prependReceivedVc',
                  on: {
                    STORE_RESPONSE: {
                      target: 'storingVc',
                    },
                  },
                },
                storingVc: {
                  entry: 'storeVc',
                  on: {
                    STORE_RESPONSE: {
                      target: '#request.reviewing.accepted',
                    },
                  },
                },
              },
            },
            accepted: {
              entry: ['sendVcReceived', 'logReceived'],
              invoke: {
                src: 'sendVcResponse',
              },
              on: {
                DISMISS: {
                  target: 'navigatingToHome',
                },
              },
            },
            rejected: {
              invoke: {
                src: 'sendVcResponse',
              },
              on: {
                DISMISS: {
                  target: '#request.waitingForConnection',
                },
              },
            },
            navigatingToHome: {},
          },
          on: {
            ACCEPT: {
              target: '.accepting',
            },
            REJECT: {
              target: '.rejected',
            },
            CANCEL: {
              target: '.rejected',
            },
            DISCONNECT: {
              target: 'disconnected',
            },
          },
        },
        disconnected: {
          on: {
            DISMISS: {
              target: 'waitingForConnection',
            },
          },
        },
      },
    },
    {
      actions: {
        requestReceivedVcs: send(VcEvents.GET_RECEIVED_VCS(), {
          to: (context) => context.serviceRefs.vc,
        }),

        requestReceiverInfo: sendParent('REQUEST_DEVICE_INFO'),

        setReceiverInfo: model.assign({
          receiverInfo: (_context, event) => event.info,
        }),

        disconnect: () => {
          try {
            SmartShare.destroyConnection();
          } catch (e) {
            // pass
          }
        },

        generateConnectionParams: assign({
          connectionParams: () => SmartShare.getConnectionParameters(),
        }),

        setSenderInfo: model.assign({
          senderInfo: (_context, event) => event.senderInfo,
        }),

        setIncomingVc: model.assign({
          incomingVc: (_context, event) => event.vc,
        }),

        registerLoggers: assign({
          loggers: () => {
            if (__DEV__) {
              return [
                SmartShare.handleNearbyEvents((event) => {
                  console.log(
                    getDeviceNameSync(),
                    '<Receiver.Event>',
                    JSON.stringify(event)
                  );
                }),
                SmartShare.handleLogEvents((event) => {
                  console.log(
                    getDeviceNameSync(),
                    '<Receiver.Log>',
                    JSON.stringify(event)
                  );
                }),
              ];
            } else {
              return [];
            }
          },
        }),

        removeLoggers: assign({
          loggers: ({ loggers }) => {
            loggers?.forEach((logger) => logger.remove());
            return null;
          },
        }),

        prependReceivedVc: send(
          (context) =>
            StoreEvents.PREPEND(
              RECEIVED_VCS_STORE_KEY,
              VC_ITEM_STORE_KEY(context.incomingVc)
            ),
          { to: (context) => context.serviceRefs.store }
        ),

        requestExistingVc: send(
          (context) => StoreEvents.GET(VC_ITEM_STORE_KEY(context.incomingVc)),
          { to: (context) => context.serviceRefs.store }
        ),

        mergeIncomingVc: send(
          (context, event) => {
            const existing = event.response as VC;
            const updated: VC = {
              ...existing,
              reason: existing.reason.concat(context.incomingVc.reason),
            };
            return StoreEvents.SET(VC_ITEM_STORE_KEY(updated), updated);
          },
          { to: (context) => context.serviceRefs.store }
        ),

        storeVc: send(
          (context) =>
            StoreEvents.SET(
              VC_ITEM_STORE_KEY(context.incomingVc),
              context.incomingVc
            ),
          { to: (context) => context.serviceRefs.store }
        ),

        logReceived: send(
          (context) =>
            ActivityLogEvents.LOG_ACTIVITY({
              _vcKey: VC_ITEM_STORE_KEY(context.incomingVc),
              action: 'received',
              timestamp: Date.now(),
              deviceName:
                context.senderInfo.name || context.senderInfo.deviceName,
              vcLabel: context.incomingVc.tag || context.incomingVc.id,
            }),
          { to: (context) => context.serviceRefs.activityLog }
        ),

        sendVcReceived: send(
          (context) => {
            return VcEvents.VC_RECEIVED(VC_ITEM_STORE_KEY(context.incomingVc));
          },
          { to: (context) => context.serviceRefs.vc }
        ),
      },

      services: {
        checkBluetoothService: () => (callback) => {
          const subscription = BluetoothStateManager.onStateChange((state) => {
            if (state === 'PoweredOn') {
              callback(model.events.BLUETOOTH_ENABLED());
            } else {
              callback(model.events.BLUETOOTH_DISABLED());
            }
          }, true);

          return () => subscription.remove();
        },

        requestBluetooth: () => (callback) => {
          BluetoothStateManager.requestToEnable()
            .then(() => callback(model.events.BLUETOOTH_ENABLED()))
            .catch(() => callback(model.events.BLUETOOTH_DISABLED()));
        },

        checkConnection: () => (callback) => {
          const subscription = SmartShare.handleNearbyEvents((event) => {
            if (event.type === 'onDisconnected') {
              callback({ type: 'DISCONNECT' });
            }
          });

          return () => subscription.remove();
        },

        advertiseDevice: () => (callback) => {
          SmartShare.createConnection('advertiser', () => {
            callback({ type: 'CONNECTED' });
          });
        },

        exchangeDeviceInfo: (context) => (callback) => {
          const subscription = SmartShare.handleNearbyEvents((event) => {
            if (event.type !== 'msg') return;

            const message = Message.fromString<DeviceInfo>(event.data);
            if (message.type === 'exchange:sender-info') {
              const response = new Message(
                'exchange:receiver-info',
                context.receiverInfo
              );
              SmartShare.send(response.toString(), () => {
                callback({ type: 'EXCHANGE_DONE', senderInfo: message.data });
              });
            }
          });

          return () => subscription.remove();
        },

        receiveVc: () => (callback) => {
          const subscription = SmartShare.handleNearbyEvents((event) => {
            if (event.type !== 'msg') return;

            const message = Message.fromString<VC>(event.data);
            if (message.type === 'send:vc') {
              callback({ type: 'VC_RECEIVED', vc: message.data });
            }
          });

          return () => subscription.remove();
        },

        sendVcResponse: (_context, _event, meta) => (callback) => {
          const response = new Message('send:vc:response', {
            status: meta.data.status,
          });

          SmartShare.send(response.toString(), () => {
            callback({ type: 'RESPONSE_SENT' });
          });
        },
      },

      guards: {
        hasExistingVc: (context, event) => {
          const receivedVcs = event.response as string[];
          const vcKey = VC_ITEM_STORE_KEY(context.incomingVc);
          return receivedVcs.includes(vcKey);
        },
      },

      delays: {
        CLEAR_DELAY: 250,
      },
    }
  );

export function createRequestMachine(serviceRefs: AppServices) {
  return requestMachine.withContext({
    ...requestMachine.context,
    serviceRefs,
  });
}

type State = StateFrom<typeof requestMachine>;

export function selectSenderInfo(state: State) {
  return state.context.senderInfo;
}

export function selectConnectionParams(state: State) {
  return state.context.connectionParams;
}

export function selectIncomingVc(state: State) {
  return state.context.incomingVc;
}

export function selectIsReviewing(state: State) {
  return state.matches('reviewing');
}

export function selectIsAccepted(state: State) {
  return state.matches('reviewing.accepted');
}

export function selectIsRejected(state: State) {
  return state.matches('reviewing.rejected');
}

export function selectIsDisconnected(state: State) {
  return state.matches('disconnected');
}

export function selectIsWaitingForConnection(state: State) {
  return state.matches('waitingForConnection');
}

export function selectIsBluetoothDenied(state: State) {
  return state.matches('bluetoothDenied');
}

export function selectIsExchangingDeviceInfo(state: State) {
  return state.matches('exchangingDeviceInfo');
}

export function selectIsWaitingForVc(state: State) {
  return state.matches('waitingForVc');
}
