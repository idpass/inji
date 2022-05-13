import SmartShare from '@idpass/smartshare-react-native';
import LocationEnabler from 'react-native-location-enabler';
import SystemSetting from 'react-native-system-setting';
import { assign, EventFrom, send, sendParent, StateFrom } from 'xstate';
import { createModel } from 'xstate/lib/model';
import { EmitterSubscription, Linking, PermissionsAndroid } from 'react-native';
import { DeviceInfo } from '../components/DeviceInfoList';
import { Message } from '../shared/Message';
import { getDeviceNameSync } from 'react-native-device-info';
import { VC } from '../types/vc';
import { AppServices } from '../shared/GlobalContext';
import { ActivityLogEvents } from './activityLog';
import { VC_ITEM_STORE_KEY } from '../shared/constants';

const checkingAirplaneMode = '#checkingAirplaneMode';
const checkingLocationService = '#checkingLocationService';

const model = createModel(
  {
    serviceRefs: {} as AppServices,
    senderInfo: {} as DeviceInfo,
    receiverInfo: {} as DeviceInfo,
    selectedVc: {} as VC,
    reason: '',
    loggers: [] as EmitterSubscription[],
    locationConfig: {
      priority: LocationEnabler.PRIORITIES.BALANCED_POWER_ACCURACY,
      alwaysShow: false,
      needBle: true,
    },
    vcName: '',
  },
  {
    events: {
      EXCHANGE_DONE: (receiverInfo: DeviceInfo) => ({ receiverInfo }),
      RECEIVE_DEVICE_INFO: (info: DeviceInfo) => ({ info }),
      SELECT_VC: (vc: VC) => ({ vc }),
      SCAN: (params: string) => ({ params }),
      ACCEPT_REQUEST: () => ({}),
      VC_ACCEPTED: () => ({}),
      VC_REJECTED: () => ({}),
      CANCEL: () => ({}),
      DISMISS: () => ({}),
      CONNECTED: () => ({}),
      DISCONNECT: () => ({}),
      SCREEN_BLUR: () => ({}),
      SCREEN_FOCUS: () => ({}),
      UPDATE_REASON: (reason: string) => ({ reason }),
      LOCATION_ENABLED: () => ({}),
      LOCATION_DISABLED: () => ({}),
      FLIGHT_ENABLED: () => ({}),
      FLIGHT_DISABLED: () => ({}),
      FLIGHT_REQUEST: () => ({}),
      LOCATION_REQUEST: () => ({}),
      UPDATE_VC_NAME: (vcName: string) => ({ vcName }),
      STORE_RESPONSE: (response: unknown) => ({ response }),
      APP_ACTIVE: () => ({}),
    },
  }
);

export const ScanEvents = model.events;

export const scanMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5SwMYEMB2A6FALMKA1gJYZQCCxATgA4A2mYAsgPYRg75GlQDKALmn4BXWAGIAYgBkAkgHEAEgBUA+gBEZvcgCEpAUTWJQNFrGL9iLDEZAAPRAFoALAEYsANgCsLpwHYAnC7uAAzuAZ4AzAA0IACeiABMThFYwQk+AByensEZLgEuAL6FMaiYnAQkZJS0DBjMbBx4lTwCQqKSsoqqegByOvqGSCAmZhZWNvYIEREZWC4u2S4ROQnusy4x8QjpKT7rGf5JrslpxaXo2M3c1dT0jKzsWFRgAI7CcBZkSixqxLBoABGdDAnXkynUmgGBhso3MlmswymTgyTnmCV87iOgQywU8GQSW0QLmCwSw-ic-gigRCQQSnip5xAZSuXCqFDudQaTzAGCBIIgYO6KgASnoAIoAVT0vCUsNM8ImSMQGWpWCyfgWuPcTicnicRJ2y3mTgOR11PgiZxKzMuFRuUCkLHQ4wwvDAVAAbsQUE02a1BCJxFIAPIAYXIShkId6Kj60KGxgVrsmjl8aKcSV8JKptMx0TiiF8qPJet8CQSwT1BNcTJZ9vZTpdCPdXp9fpaZDaQbEoYjUZjkK0uhhwzhKeVOz8WAxC3Lvg2YX8hpyKW8eoxCVVWPxdbt10bzqELY93t9zzeH1gXygPz0fOBoL7kejsfjI8TI2TCNTU7mxYiLxKRmCJs1yQ0sTJPx3EWDJUT1UD3D3coDx4JtjysVszw4F53k+Hg7wfEFe3DF9Bw0YdBnlMYf0nbUPASCkQgrdcIk2QsEAZTwsGyTEFhWLF-B1ZDWU7R0j1dLD2wbHgAAUPQAW3+MwrBI-tXzjfoP2oxVEVAKYkn-bd-FyRj3ErTxDQpXwePpISUQyXx8TgkSZLIdDJNPaTULIeSqCU2AVIwNSyNjCiEx0id9MQTxfCgq1IgpDJ3BCVxDTydwsBRSsK3SEkZiQm16x88Tm0wrzz3YDBiEgEKB1jMUpRlOUx2-JVooQXE5jWLF0kxVUTILbYvG4hdi1CSsSSxQqLhQ-13Ikk820q3kasFchZNklRyDDKMADU9Ei2iOuY8kkgiCsUvpA0OPM-xyT4kI4upczXJKjyluwrAIH+flauferRQlaVZSO9q7BinUPAKlwhIiZIGRXYI1x8Tx6StJzGIyN6QTQKgeDDKx6hQV0xFsa8hA4NAADN+A9AAKMN9HIEV1D0KRyAATQASjEYrcfxshCYwYmoq-GjwYM7wPHxMJVQJGDXF8Q0SWCNw-ECWYHMiPVXOp0gfqFomCFJ3gI16MG9IhhBklspIFm8KtFlJG7tgWFEsAu-IXC3FKSUxVyaBeGg8YIlhhdFsQxTDPQZAOtm9pkGOVBkXoJBDS3fwSeGsrSRZ-ECfxs2SV3iVOVJcRWSIrSpFxsaK-djZJngxDDGNej0XbRyTCWramBwkk97xVkdn2NxV2KEnmdZ9VAlYji3VywFsPBMCgHg1DAbCZAwamWDECi296DvdszycKxsjLM2u9M5YyFWsRs2KnGRzU1aOGbbXKZfV7IDet-bDvPeYg9AAA0wwKHIL0OQeh1AxkOq1Xuv5nBT1mCZcsMxKzZkWCrDKWAxqHFNGEFYC5XIvG9GAAA7jwLAxAIDER2jHWSqhGogxaj3XSyD-BzGymxBkjlAjBHTIaFiZJna+ExOg8saMyEAKoTQ2AYAQTNzIHtFAYheDs07qoPaYYz4dVhlPXUOpswmJCJ4dwIiZhomIcjVEuwFwRFkRQ6hZAsCKOUTeNRrcoExykPo62WQsoSNvq4ZYyM2IiPpGInIEjIISPpAkZxNVXFQHcbyQ2UBvG6O2mGJhShu7i04ZONGUFTSYkYjXOKy4OIVgJFldwqpAJOTro03wyT5FuMURgTJ2SwxAwAFLaMKeOY61sZhuHhviYIFJMwCNRCI5ImU1iMVyOZIRDIOmpKwGgFAvoaB00FBRJgmheABKmLPGcL99RFx1EXRGtS0ZTzijMq0uprL11mtgchKSW7mz8ecxAWI0QWLij7SI+J-AWNwdkdUuoJGUhypEdpDdyg-M6VAA+mgTm8DOYg4pHVHIpBSgjTM6DkqWQ4nXWF8EEVHDSMirZLdJSyTUJGWBYpyC8BjICzqrhyRqwCM0rWRxFkhHJFkUIVp0YkicEysgWKzbt20by6sM5QiuEMtnSIliqV5CnkSjZBdzLMVcj9VATdDmKpxXijhYtkQSJ4lKvI1YnbsTdpPaeKxALLHsiir5tCMCejQHQOh1rTm8ocEEyRMwKTpH1Fke+VKZlTypFWU0EzvD+BEhosMYo+gqF0JKEUkbpbmkxGkbOeITJCUNA4ZYNkYLOpWNuDBOazb5tjOnMMkpbVFPtTFfEPFyymkpEXa6Q1HANo8FNWYLbmnZ2KDaDAjR4DDHrKQXZFhPRgEjVCmcbE1batcDrSl2wHCwrsfkLcE0LG6jevNDktQHiNDcnwQMoheWwzJGEZYSRkb8WyGexAFIsrAUcnia5sVs2otEg6Go9x6iPBwpefC3xfi-UfLyipPEshMUCAycsEE5gUipMWOZcV8Rytg2+hDXJkNYF5H9CAvKGTEuYtkFZ1I8giNCB4DNqJpqTxcjRkqdGX3sC-SlDw2YLovzYssIDdbL05HMnqLUmaH1iQ+uVZaHYHTdk-figdCAHALlsn4U4mpjjKw4pSGyasNxPR3BiLTDodNugqihvC14w73j+l+qk+C8oSLxGjfE2QVzrB4rFGCvs-AXU+V-ODh4yqeb02+vyAUgqBbJNkZKcE4rrDxGEQ0mNSyxVmNnDWSXiqPo81JFa1VIC8tVI2lKUKlx4nyGV6LiSX5xVNIJtzqWMLpa+ua5jrWLo8ULr1Ys1TS42yLqkVGawhEuf9clt9DWvN7p4VmHMgFBXrENHPVbG42KAVcKBHGYBQ5GxFibMZozJaOC8MErwQj0j-rJVZD2ARTSwx8Ay1EesDYE0tS9tqfcix13VOt9IXgWK6iskJfBbEKSkhmaqUIgdg4PdvOHS1vKLqppYrjpIBcggqzrpfJH1irS+pgwGlAUOyCRvTLhjE5pAiwUiCrJWuHkb6jvfnLb9Yf64DXv-beu8WB7qnnXDE5ZlghHscBhAQQPvP2RhWF+bWig0fRdsuhIJI0+HJFieGqJ+GARWEt9Iporn2-yEJIuEu7Qm4UUo57qiUCRpmFlWYuQmI3r8Em7Y1XG0LlCF4ICaz5VpO6b0gPxmxlTHt1lW5TSfZwUOLZqPPsyTpmuxWEyqInHG7kds3Z+zDmqvR9V7OsMmegsd6BNw3DuFTWSFdpPF4ABWJsWvp7e6Z9I+CLGV+ziZFKcFCS1LJdn9MkHXB4gkQPvk3ooDHnQwoFgCld1j9h6Z2KudGlZsB8ZERw9yQO83I-Tf1eXE8AtxWLKBI+HcIKEIpbsNxVS9it3ZNQzV-g2cnsSZR87UM9EBkh7oQg1YvByNVRUcqUsQ3A-87FAItw65XJSBg1Q0WMT8uEeFW9dRcgnY8RI9iQtw0QCQgh8hsFQInIRILdndeF84BF-YlsB4P8m0dQ65SUHYl1CggA */
  model.createMachine(
    {
      tsTypes: {} as import('./scan.typegen').Typegen0,
      schema: {
        context: model.initialContext,
        events: {} as EventFrom<typeof model>,
      },
      id: 'scan',
      initial: 'inactive',
      on: {
        SCREEN_BLUR: {
          target: '.inactive',
        },
        SCREEN_FOCUS: {
          target: '.checkingAirplaneMode',
        },
      },
      states: {
        inactive: {
          entry: 'removeLoggers',
        },
        checkingAirplaneMode: {
          invoke: {
            src: 'checkAirplaneMode',
          },
          initial: 'checkingStatus',
          states: {
            checkingStatus: {
              on: {
                FLIGHT_DISABLED: {
                  target: '#scan.checkingLocationService',
                },
                FLIGHT_ENABLED: {
                  target: 'enabled',
                },
              },
            },
            requestingToDisable: {
              entry: 'requestToDisableFlightMode',
              on: {
                FLIGHT_DISABLED: {
                  target: 'checkingStatus',
                },
              },
            },
            enabled: {
              on: {
                FLIGHT_REQUEST: {
                  target: 'requestingToDisable',
                },
              },
            },
          },
        },
        checkingLocationService: {
          invoke: {
            src: 'checkLocationStatus',
          },
          initial: 'checkingStatus',
          states: {
            checkingStatus: {
              on: {
                LOCATION_ENABLED: {
                  target: 'checkingPermission',
                },
                LOCATION_DISABLED: {
                  target: 'requestingToEnable',
                },
              },
            },
            requestingToEnable: {
              entry: 'requestToEnableLocation',
              on: {
                LOCATION_ENABLED: {
                  target: 'checkingPermission',
                },
                LOCATION_DISABLED: {
                  target: 'disabled',
                },
              },
            },
            checkingPermission: {
              invoke: {
                src: 'checkLocationPermission',
              },
              on: {
                LOCATION_ENABLED: {
                  target: '#scan.clearingConnection',
                },
                LOCATION_DISABLED: {
                  target: 'denied',
                },
              },
            },
            denied: {
              on: {
                LOCATION_REQUEST: {
                  actions: 'openSettings',
                },
                APP_ACTIVE: {
                  description: 'Check permission again when app regains focus.',
                  target: 'checkingPermission',
                },
              },
            },
            disabled: {
              on: {
                LOCATION_REQUEST: {
                  target: 'requestingToEnable',
                },
              },
            },
          },
        },
        clearingConnection: {
          entry: 'disconnect',
          after: {
            CLEAR_DELAY: {
              target: 'findingConnection',
            },
          },
        },
        findingConnection: {
          entry: ['removeLoggers', 'registerLoggers'],
          on: {
            SCAN: [
              {
                actions: 'setConnectionParams',
                cond: 'isQrValid',
                target: 'preparingToConnect',
              },
              {
                target: 'invalid',
              },
            ],
          },
        },
        preparingToConnect: {
          entry: 'requestSenderInfo',
          on: {
            RECEIVE_DEVICE_INFO: {
              actions: 'setSenderInfo',
              target: 'connecting',
            },
          },
        },
        connecting: {
          invoke: {
            src: 'discoverDevice',
          },
          on: {
            CONNECTED: {
              target: 'exchangingDeviceInfo',
            },
          },
        },
        exchangingDeviceInfo: {
          invoke: {
            src: 'exchangeDeviceInfo',
          },
          on: {
            DISCONNECT: {
              target: 'disconnected',
            },
            EXCHANGE_DONE: {
              actions: 'setReceiverInfo',
              target: 'reviewing',
            },
          },
        },
        reviewing: {
          exit: ['disconnect', 'clearReason'],
          initial: 'idle',
          states: {
            idle: {
              on: {
                ACCEPT_REQUEST: {
                  target: 'selectingVc',
                },
              },
            },
            selectingVc: {
              on: {
                SELECT_VC: {
                  actions: 'setSelectedVc',
                  target: 'sendingVc',
                },
                CANCEL: {
                  target: 'idle',
                },
              },
            },
            sendingVc: {
              invoke: {
                src: 'sendVc',
              },
              on: {
                VC_ACCEPTED: {
                  target: 'accepted',
                },
                VC_REJECTED: {
                  target: 'rejected',
                },
              },
            },
            accepted: {
              entry: 'logShared',
              on: {
                DISMISS: {
                  target: 'navigatingToHome',
                },
              },
            },
            rejected: {},
            navigatingToHome: {},
          },
          on: {
            CANCEL: {
              target: 'findingConnection',
            },
            DISMISS: {
              target: 'findingConnection',
            },
            UPDATE_REASON: {
              actions: 'setReason',
            },
            DISCONNECT: {
              target: 'disconnected',
            },
          },
        },
        disconnected: {
          on: {
            DISMISS: {
              target: 'findingConnection',
            },
          },
        },
        invalid: {
          on: {
            DISMISS: {
              target: 'findingConnection',
            },
          },
        },
      },
    },
    {
      actions: {
        requestSenderInfo: sendParent('REQUEST_DEVICE_INFO'),

        setSenderInfo: model.assign({
          senderInfo: (_, event) => event.info,
        }),

        requestToEnableLocation: (context) => {
          LocationEnabler.requestResolutionSettings(context.locationConfig);
        },

        requestToDisableFlightMode: () => {
          SystemSetting.switchAirplane();
        },

        disconnect: () => {
          try {
            SmartShare.destroyConnection();
          } catch (e) {
            //
          }
        },

        setConnectionParams: (_, event) => {
          SmartShare.setConnectionParameters(event.params);
        },

        setReceiverInfo: model.assign({
          receiverInfo: (_, event) => event.receiverInfo,
        }),

        setReason: model.assign({
          reason: (_, event) => event.reason,
        }),

        clearReason: assign({ reason: '' }),

        setSelectedVc: model.assign({
          selectedVc: (context, event) => {
            const reason = [];
            if (context.reason.trim() !== '') {
              reason.push({ message: context.reason, timestamp: Date.now() });
            }
            return { ...event.vc, reason };
          },
        }),

        registerLoggers: assign({
          loggers: () => {
            if (__DEV__) {
              return [
                SmartShare.handleNearbyEvents((event) => {
                  console.log(
                    getDeviceNameSync(),
                    '<Sender.Event>',
                    JSON.stringify(event)
                  );
                }),
                SmartShare.handleLogEvents((event) => {
                  console.log(
                    getDeviceNameSync(),
                    '<Sender.Log>',
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
            return [];
          },
        }),

        logShared: send(
          (context) =>
            ActivityLogEvents.LOG_ACTIVITY({
              _vcKey: VC_ITEM_STORE_KEY(context.selectedVc),
              action: 'shared',
              timestamp: Date.now(),
              deviceName:
                context.receiverInfo.name || context.receiverInfo.deviceName,
              vcLabel: context.selectedVc.tag || context.selectedVc.id,
            }),
          { to: (context) => context.serviceRefs.activityLog }
        ),

        openSettings: () => {
          Linking.openSettings();
        },
      },

      services: {
        checkLocationPermission: () => async (callback) => {
          try {
            // wait a bit for animation to finish when app becomes active
            await new Promise((resolve) => setTimeout(resolve, 250));

            const response = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              {
                title: 'Location access',
                message:
                  'Location access is required for the scanning functionality.',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              }
            );

            if (response === 'granted') {
              callback(model.events.LOCATION_ENABLED());
            } else {
              callback(model.events.LOCATION_DISABLED());
            }
          } catch (e) {
            console.error(e);
          }
        },

        checkLocationStatus: (context) => (callback) => {
          const listener = LocationEnabler.addListener(
            ({ locationEnabled }) => {
              if (locationEnabled) {
                callback(model.events.LOCATION_ENABLED());
              } else {
                callback(model.events.LOCATION_DISABLED());
              }
            }
          );

          LocationEnabler.checkSettings(context.locationConfig);

          return () => listener.remove();
        },

        checkAirplaneMode: () => (callback) => {
          SystemSetting.isAirplaneEnabled().then((enable) => {
            if (enable) {
              callback(model.events.FLIGHT_ENABLED());
            } else {
              callback(model.events.FLIGHT_DISABLED());
            }
          });
        },

        discoverDevice: () => (callback) => {
          SmartShare.createConnection('discoverer', () => {
            callback({ type: 'CONNECTED' });
          });
        },

        exchangeDeviceInfo: (context) => (callback) => {
          let subscription: EmitterSubscription;

          const message = new Message(
            'exchange:sender-info',
            context.senderInfo
          );
          SmartShare.send(message.toString(), () => {
            subscription = SmartShare.handleNearbyEvents((event) => {
              if (event.type === 'onDisconnected') {
                callback({ type: 'DISCONNECT' });
              }

              if (event.type !== 'msg') return;
              const response = Message.fromString<DeviceInfo>(event.data);
              if (response.type === 'exchange:receiver-info') {
                callback({
                  type: 'EXCHANGE_DONE',
                  receiverInfo: response.data,
                });
              }
            });
          });

          return () => subscription?.remove();
        },

        sendVc: (context) => (callback) => {
          let subscription: EmitterSubscription;

          const vc = {
            ...context.selectedVc,
            tag: '',
          };

          const message = new Message<VC>('send:vc', vc);

          SmartShare.send(message.toString(), () => {
            subscription = SmartShare.handleNearbyEvents((event) => {
              if (event.type === 'onDisconnected') {
                callback({ type: 'DISCONNECT' });
              }

              if (event.type !== 'msg') return;

              const response = Message.fromString<SendVcStatus>(event.data);
              if (response.type === 'send:vc:response') {
                callback({
                  type:
                    response.data.status === 'accepted'
                      ? 'VC_ACCEPTED'
                      : 'VC_REJECTED',
                });
              }
            });
          });

          return () => subscription?.remove();
        },
      },

      guards: {
        isQrValid: (_, event) => {
          const param: SmartShare.ConnectionParams = Object.create(null);
          try {
            Object.assign(param, JSON.parse(event.params));
            return 'cid' in param && 'pk' in param;
          } catch (e) {
            return false;
          }
        },
      },

      delays: {
        CLEAR_DELAY: 250,
      },
    }
  );

export function createScanMachine(serviceRefs: AppServices) {
  return scanMachine.withContext({
    ...scanMachine.context,
    serviceRefs,
  });
}

interface SendVcStatus {
  status: 'accepted' | 'rejected';
}

type State = StateFrom<typeof scanMachine>;

export function selectReceiverInfo(state: State) {
  return state.context.receiverInfo;
}

export function selectReason(state: State) {
  return state.context.reason;
}

export function selectVcName(state: State) {
  return state.context.vcName;
}

export function selectIsScanning(state: State) {
  return state.matches('findingConnection');
}

export function selectIsConnecting(state: State) {
  return state.matches('connecting');
}

export function selectIsExchangingDeviceInfo(state: State) {
  return state.matches('exchangingDeviceInfo');
}

export function selectIsReviewing(state: State) {
  return state.matches('reviewing');
}

export function selectIsSelectingVc(state: State) {
  return state.matches('reviewing.selectingVc');
}

export function selectIsSendingVc(state: State) {
  return state.matches('reviewing.sendingVc');
}

export function selectIsAccepted(state: State) {
  return state.matches('reviewing.accepted');
}

export function selectIsRejected(state: State) {
  return state.matches('reviewing.rejected');
}

export function selectIsInvalid(state: State) {
  return state.matches('invalid');
}

export function selectIsLocationDenied(state: State) {
  return state.matches('checkingLocationService.denied');
}

export function selectIsLocationDisabled(state: State) {
  return state.matches('checkingLocationService.disabled');
}

export function selectIsAirplaneEnabled(state: State) {
  return state.matches('checkingAirplaneMode.enabled');
}
