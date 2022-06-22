import SmartShare from '@idpass/smartshare-react-native';
import LocationEnabler from 'react-native-location-enabler';
import SystemSetting from 'react-native-system-setting';
import { assign, EventFrom, send, sendParent, StateFrom } from 'xstate';
import { createModel } from 'xstate/lib/model';
import { EmitterSubscription, Linking, PermissionsAndroid } from 'react-native';
import { DeviceInfo } from '../components/DeviceInfoList';
import { Message } from '../shared/Message';
import { getDeviceNameSync } from 'react-native-device-info';
import { VC, VerifiablePresentation } from '../types/vc';
import { AppServices } from '../shared/GlobalContext';
import { ActivityLogEvents } from './activityLog';
import { VC_ITEM_STORE_KEY } from '../shared/constants';
import { CameraCapturedPicture } from 'expo-camera';

// TODO: remove sample data when task is done
// import sampleVp from '../shared/vcjs/sample-vp.json';
import { FaceScanResult } from './faceScanner';
// import { createVerifiablePresentation } from '../shared/vcjs/createVerifiablePresentation';
// import { verifyPresentation } from '../shared/vcjs/verifyPresentation';
import { createVerifiablePresentation } from '../shared/vcjs/createVerifiablePresentation';

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
    verificationImage: {} as CameraCapturedPicture,
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
      VERIFY_AND_SELECT_VC: (vc: VC) => ({ vc }),
      RETRY_CAPTURE: () => ({}),
      FACE_DETECTED: (face: FaceScanResult) => ({ face }),
      VERIFICATION_FAILED: () => ({}),
      VERIFICATION_SUCCESS: () => ({}),
      VP_CREATED: (vp: VerifiablePresentation) => ({ vp }),
    },
  }
);

export const ScanEvents = model.events;

export const scanMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5SwMYEMB2A6FALMKA1gJYZQCCxATgA4A2mYAsgPYRg75GlQDKALmn4BXWAGIAYgBkAkgHEAEgBUA+gFEAcuQBCUtQBFEoGi1jF+xFhiMgAHogBMANgdYAjE4AcATgAsn339PAGYAdgBWUIAaEABPRzdgrHCnAAZPB0zfN09U8ODfAF9CmNRMTgISMkpaBgxmNg4wDDQAIzpISVlFVQAlNQBFAFU1XiUbEzMLKxt7BCcnNyxM1NT-b3CHVIKnGPiEB0TktIysnLyC4tL0bDxKnhr6RlZ2LvllFX0ZXh09QyQQJNzJZrAC5ilQlhQsFgt4nN5QpknL4IntEMFUt4sAFguEQgFwtsUUUSiAyrcuFUKNQnvUXmAxOQAApMlTkADCShkADU1BNTMCZmDHBl3A5wm5QvjPItMWiEABaVLJTxuVKhUK+Jy43x4hy6q5km4VbhkKQsdDTDC8MBUABuxBQHDupr4ghE4ikAHl2eQuV6NOotLoDPypiDZohslgChFAr5glkdfKpZ4Y5rDpl9dknIbySaqebLSCbfbHc7KTwBEJRGJvb7-YGvj8Q-9jAKrZGEImki4Lk48d5EpF5YSnFg-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-DqhcNvTUyxBprTi0fQeS7H2bsJUpkl-aFRpGnT4RKoXysW0xK4S2+QPD+MXUaTAVi8NqE0CoXQP6msSgnOe2FlzE4qM6gqKOkI1hhc1IiU6WpglDYwCN-o42q7siGJlnZOaEDE2SKsKU+oqIfgnStyIZCNsokyAEZExRSQYEaPAAE+ZSA4osOGprGwytqlagsZK-X5QKmogw3IZx0h5fpgl5yjw6gNHYBlN0NY-tZcVQcAOPVnDhwq1sCd8IYwGvW5B-6qOl3o5pJj+ky7kI8yzvoR6F5AshAnBKSZ517PtwOlieOuRsh06nAzvbOOMfPEaFgZoT0ID9pRMqHb630irEiDRzqQnl4nHOgEfGOu4aunl3SRo-aciQg8KTz85O8iw-h+AsGeJCSJg2HotHN0Eb8SRghHH1YPRq9cOe-IaRdqO-hZ1bSrgaIeH8JRfLtbffw0Rg5ZGbODwc+PKec8HR93QuXtC7SYMfAylHAsP6JwwY-iUVA9PrpM-ZWz85Vy7lpK6wVcRg4NfAK5E2AUTE6ogGdUbumJRCi1r128Oblc9k29B6mpAVTu1l7XsiiTGUGIRf7ClEsXuSjdrwkY1KBf0EA9Z5X9zjoqvOOE8HxObIMINKovSKDDXSjIbopOonS-W6QPcsG3QZFEG2CyO7fIJbcmRODRH-SKHwS6JRNaBmMATONWFLEFXvLsCtQ-bIIaRIaFQfIyaOGULwFAu2fGJ2F2N2DWWpaqHAkiKcKEahT8IXaELULrVYIOGDc6DYeEVqdKNOMADOPlE8HOD2ftWEccPqRERMVqXuBYGAxAINSmWOaiIGSUcUXbGyLAsgabJefUDwTUHeAtPEDuXSBqTYbUREROOEFEaBc+MgeBW+e+FgJrREbEHMDUJiI5ffVQkCUBFwMINRFjBLeTVdARMAXnZYbYVqBEbUdVCOfXKOeqSIC4euVbU6eDaJWpVZaQw9RvJQ9gopMDWcCcaZORaGNYGXfMSIt5ZZOpFAfdLEFEalREfSSZBEVRGiVwIaeQyUECH3OTFdSJHFPFAlG3LYBqQgwkfUdxZQ1RXuCDaFPqZuBYSUeDHcAAKw9jX0fz7zBXHAMgDhamRH1HyE1X1yQInDWJLVyADkuAiLGKqRaAdCgCQygBPAUBYDEhiMOK7ADimTOgcNOjP17npTCyhC-DSBYhNj6ng3NREEtUFW3VbTVxlA0VEwo1nH1Gd31y2CxF1R8DWlOgPkG3qNeKwAbUjWjTIHRLFX7UTlcEhyjgxANVVAnQWKXn8GyASNjgZVk1lwaIfQwHXTq0ZP2AJz7znGtmvU0X9RyFUR2wnCvRCFahi2ThFOpJQEQ1iW5BQ2IDQww1tSyjV2e1OnJNjkyE4ICIODL3ow-HPX1TT1GIqR4E8MhDhFTAUSY2UQtnCnSOhUgxCn-kyHSiSxQBSwOJlK7HWDuLjBWHsPH32A8FjncDASUURH8C2IS1q34U8KSESEr2PxyHRRUJE3BIOTjgKBhBZPn2NSazRXB3nCh3C0e31FZOyDVChWRF1BYi+0KCAA */
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
          initial: 'checkingStatus',
          states: {
            checkingStatus: {
              invoke: {
                src: 'checkAirplaneMode',
              },
              on: {
                FLIGHT_ENABLED: {
                  target: 'enabled',
                },
              },
            },
            requestingToDisable: {
              entry: 'requestToDisableFlightMode',
            },
            enabled: {
              on: {
                FLIGHT_REQUEST: {
                  target: 'requestingToDisable',
                },
              },
            },
          },
          on: {
            FLIGHT_DISABLED: {
              target: 'checkingLocationService',
            },
            APP_ACTIVE: {
              target: '.checkingStatus',
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
          on: {
            FLIGHT_ENABLED: {
              target: 'checkingAirplaneMode',
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
                VERIFY_AND_SELECT_VC: {
                  actions: 'setSelectedVc',
                  target: 'capturingUserIdentity',
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
            capturingUserIdentity: {
              description: 'Open camera and capture an image of the user.',
              on: {
                FACE_DETECTED: {
                  target: 'verifyingIdentity',
                },
                CANCEL: {
                  target: 'selectingVc',
                },
              },
            },
            verifyingIdentity: {
              description:
                "Use SDK to compare 2D image from user's camera and image in VC.",
              invoke: {
                src: 'verifyIdentity',
              },
              on: {
                VERIFICATION_SUCCESS: {
                  target: 'creatingVerifiablePresentation',
                },
                VERIFICATION_FAILED: {
                  target: 'invalidIdentity',
                },
              },
            },
            invalidIdentity: {
              on: {
                CANCEL: {
                  target: 'selectingVc',
                },
                RETRY_CAPTURE: {
                  target: 'capturingUserIdentity',
                },
              },
            },
            creatingVerifiablePresentation: {
              invoke: {
                src: 'createVerifiablePresentation',
              },
              on: {
                VP_CREATED: {
                  target: 'sendingVc',
                },
              },
            },
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

        verifyIdentity: (context, event) => async (callback) => {
          // TODO: use SDK verify identity
          const doesFaceMatch = (vcFace: string, scannedFace: string) => {
            console.log('doesFaceMatch', vcFace, scannedFace);
            return Promise.resolve(Boolean(Math.round(Math.random())));
          };

          const vcFace = context.selectedVc.credential.biometrics.face;
          const scannedFace = event.face.image.base64;
          const result = await doesFaceMatch(vcFace, scannedFace);

          setTimeout(() => {
            if (result) {
              callback(ScanEvents.VERIFICATION_SUCCESS());
            } else {
              callback(ScanEvents.VERIFICATION_FAILED());
            }
          }, 3000);
        },

        createVerifiablePresentation: (context) => async (callback) => {
          // TODO: create and sign Verifiable Presentation
          const challenge = '???';
          const vp = await createVerifiablePresentation(
            context.selectedVc.verifiableCredential,
            challenge
          );

          setTimeout(() => {
            callback(ScanEvents.VP_CREATED(vp));
          }, 3000);
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

export function selectIsCapturingIdentity(state: State) {
  return state.matches('reviewing.capturingUserIdentity');
}

export function selectIsVerifyingIdentity(state: State) {
  return state.matches('reviewing.verifyingIdentity');
}

export function selectIsCreatingVerifiablePresentation(state: State) {
  return state.matches('reviewing.creatingVerifiablePresentation');
}

export function selectIsInvalidIdentity(state: State) {
  return state.matches('reviewing.invalidIdentity');
}
