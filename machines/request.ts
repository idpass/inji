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
  /** @xstate-layout N4IgpgJg5mDOIC5QCcwEcCucAuA6AxgBZj4DWAlgHZQBCANltgPZPaEDKYyAbufmAWJkqUAMQ0AMgFUAogBUA8grkAJAPoyAcgEFJMgCKJQAByaxy2ck0pGQAD0QAWABzPcjgMwAmAGwefAJwArD5eAOxBAQA0IACeTs4AjLgejr5BHgGJAAweiQEAvgUxqJg4giQU1PSMLGycPHwCRJUi4tLySqpq+gCS7LoSBram5pbWtg4ILm6evv7BoRHRcYip2bhhaT5BiaGJQdnZPkUl6FiweC3C1QxgzKwcXLz8uKUXltTtsorK6lqDYZIECjCxWGzAqYBLwbDxbIJeSKImHOMIxeIIDxBRy4cKRZxBMKJMIk1KOU4gd7la5VWh3B71Z5NN7nHBtSQ-LrqPoDPSGYGg8YQ0BTRJeAIeXEhY4ShGOLboxBeVKbZYBHzZInBYnk4qU1mXCo3Om1R4NF4CMCUACGACM6JBRCMzGCJpDEGKJVKNYEsV55Y5FdMwpLUWEAq4khlNSc9VTDfgHdbkCIAMLWSgkIWiOyXa3YATWgBmBeQAApU0NtAAlHoyCTaACaAEpRPGrkmU9R05RM-ghc6xuDJohnF4g-k-Lhso4AgFHIEto4ggiKe3cAB3a1g6gAMSYyB7fezqYUmk0MlTciBJhdA-dCBXG3y2SyPkCr5hgdWCC84qCuARscRw+GOJLvmuBp4FuO5QPuh4Zlm4KiDyp7npeciDq6wr2IgT64C+b4ftCM4TnOATTkEBISoiY7OKEkFlIaxioMYyYiHITAyHYRDWtQYC9JQRZMKI1aXjIvQAGoyHWkm9KmMm9Jou4KFh94iogoRBuEM6Ac42RUa+iSOEcuSMR8uBgDxhB8VAIj6GAFqCcJogyAAGqmKjaJoADiMn6GeMhqcOD4ItpmQAUBhIBLkLiZOZ5QwZ8cEHpJ+Aof0aEXlewVuhpCBaT+XjEj47j6T4iQ5AsK4JYaSUiPBaWiJJqZqGJClSTeIJ3iF+V-rMmqEhExk+C4jjfhioGRTsARbME+lhMVtV4KgvBgBuIi4Na+D8MYyUskxyXViQYDkNwkBpbAzWtWJ7AAApnuwQUCj1eW4QgexztOIH0dkSTLB4QbOP4uDvpEJL+nk3iJMtLJrRt1BbTtYB7Zt7YiNx5CXCITXsIoYltTI92Pc9t5Dm9UzFeEqoLhGcLBFkE2jrNoMzTFY7zj4YTOLDq3kOtm3bbt+0ALZcHZ1CCfgTAizj6V4woBO3Q9mhPblOGUyEyQ5PkxUeJqM7jj+zgs2Dc5-eKC7c7zjn8wjUBI8Lm0sSjVoQCIx38GdF3y-jMnKyT6sjh9gQUaZoEav9kSAz+ESlcc+IEiZo3zjb8OC8jqOI5cB5y6ICtK0TKtqy95Ma0qWsEdkuuJPrYSG0GcfTjNrjYscs66mch1w3bGfC46PIALL9OwQcPgcYSlb4zgBls4ZJM4E7ygByKhJzwSLZ3+rd3zAuI6gABWWYD-0w-sKPpfYcHi3adkxXTgc4QxQZ9ernGUE93vYjaKmCl3Zhl91LvVrl4NwiIfSyn9AqWOxJAIt1CLsYGr4069y+GJAAUhhMe+UQFgOlL6OU0CMQ5GBgRbw744T6RnKnd+O9bZf1EKmbyCkJDYOAd4PBEC-QBgnLkACIDQLjVcMnWG7tYDS17MfCAGV2BnwvmTK+oVDgERikRVRX4yK7EovRWu6p3xpDCMtfOqYxJaDUByasbCphpF4aGVwRxob6x2HfIx7ATEyDMSpVMUh5HdTLsHGxP40gUXrhKYkCIEThAJEUPUlAmAQDgLYdcVBtqWHOlYj0EZcAmznOGPIjh8geCKUDZI3NwwxUJD9fwsMaQiBqPcOoTxGivFqdQDJv40hSiOPkSeYZIg+CDONACoS67EhyLOGqtCLKtJNA0s0TJXjozaYA3q7165hEopPKGEp5poh-HkNwo15gm25ocLe64Zn1IZE0i0lkbT2kgO0yqWJALwmKuVP6IZBmLTKpkYGJVXy7HOR-S59JGnmiaO095XTq6zVAiSfp2llyg22IcSIxIYRFNhvaU0bAHKUH5hAJ5uxkiuByH4cM1cQiLyKkUlISRzZzBDNCWMXdpmdjTIhfsqzBSrNFJkHEVFKoGQ8KiXw85BlaJJOGSeGK8ivlZdvCy9U9wHiPEhN6vKKZKm5gRQ4uRgbBDvvkMivhpwzw1MuE2d9AiwxdmxLsUBOLcV4vxZyTB2mBFmDNZOGQIwFO0uEOxBl7GZGtlM8oVlXUSygA5JyQkPUrO1b+Ek2T9WJDojOfSMcMThAOOakNuRwj1y8LDFVKVkBpXaYEjE9ccRZHBsvbwngggoK-rgcgEAHRPI4d6GU3CiEemMtrchnhNSfXFG2+2jsUb7SWVAT2p1zoQEuk8+Ukodgal2OOuccIgYRFwCEcGC9RpEinX3WdaMoIYzsFjZKVak3lw+lkDZd9CQwiJDPKiNKMSogAke2aJ75QwwjYaXe06haXsRmLZAMapYyzllCqG045xczHM4oI+7-0zW5hm09IG2XlHAxerODt7Vuw9idb2K78Brq2Oa5UMINTNr3bHOl6pwZUThQiQxoGVr0Ig5nfaOdHUPoUUA0U85JS+ANSELEy5EiN3Yzhrjk8ePnsRpB0ja7Zyg2lNurUEo9mTQ1HA-Ew0-q2r45-QT-ciWPuDrXKc4D+2EKZh9NIkoSJ+H8AU2VpbrPEf3mAI+-ZHkOfHuNDd+mciGdY8QmcpUzbA3WeNLmGmHY2l4FAfMHEmAqBlmAJ5oEKLYlSItEk9FipLxDGmqror9ZYjnBlntukXMEKge5uUZmIwZpDKK7EoisYSOPOF8TfLEAlubtHFthwsQ-qVKZAio0qKypiiGXjhHLhPIWwgAAtNJyquSkhcwON4VtMSgA */
  model.createMachine(
    {
      tsTypes: {} as import('./request.typegen').Typegen0,
      schema: {
        context: model.initialContext,
        events: {} as EventFrom<typeof model>,
      },
      id: 'request',
      initial: 'inactive',
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
      invoke: {
        src: 'checkConnection',
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
        checkConnection: () => (callback) => {
          const subscription = SmartShare.handleNearbyEvents((event) => {
            if (event.type === 'onDisconnected') {
              callback({ type: 'DISCONNECT' });
            }
          });

          return () => subscription.remove();
        },

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

        advertiseDevice: () => (callback) => {
          SmartShare.createConnection('advertiser', () => {
            callback({ type: 'CONNECTED' });
          });
        },

        exchangeDeviceInfo: (context) => (callback) => {
          const subscription = SmartShare.handleNearbyEvents((event) => {
            if (event.type === 'onDisconnected') {
              callback({ type: 'DISCONNECT' });
            }

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
            if (event.type === 'onDisconnected') {
              callback({ type: 'DISCONNECT' });
            }

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
