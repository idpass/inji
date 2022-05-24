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
  /** @xstate-layout N4IgpgJg5mDOIC5SwMYEMB2A6FALMKA1gJYZQCCxATgA4A2mYAsgPYRg75GlQDKALmn4BXWAGIAYgBkAkgHEAEgBUA+gBEZvcgCEpAUTWJQNFrGL9iLDEZAAPRAFoALAEYsANgCsLpwHYAnC7uAAzuAZ4AzAA0IACeiABMThFYwQk+AByensEZLgEuAL6FMaiYnAQkZJS0DBjMbBx4lTwCQqKSsoqqegByOvqGSCAmZhZWNvYIEREZWC4u2S4ROQnusy4x8QjpKT7rGf5JrslpxaXo2M3c1dT0jKzsWFRgAI7CcBZkSixqxLBoABGdDAnXkynUmgGBhso3MlmswymTgyTnmCV87iOgQywU8GQSW0QLmCwSw-ic-gigRCQQSnip5xAZSuXCqFDudQaTzAGCBIIgYO6KgASnoAIoAVT0vCUsNM8ImSMQGWpWCyfgWuPcTicnicRJ2y3mTgOR11PgiZxKzMuFRuUCkLHQ4wwvDAVAAbsQUE02a1BCJxFIAPIAYXIShkId6Kj60KGxgVrsmjgibgJCSpvl8nlzaV8PkNvgyvlS+Qymd8pP8BKZLPt7KdLoR7q9Pr9LTIbSDYlDEajMchWl0MOGcJTyp2h3Vvizepp7gJWUNOU8WHx7iX+YCWIp9bt1ybzqErY93t9zzeH1gXygPz0fOBoP7kejsfjo8TI2TCNTO0CLBZn1BI8i1DJ3ENLEEg3FF038UJKwWXwD3KI8eGbU8rDbC8OBed5Ph4B8nxBPtwzfIcNBHQZ5TGP8p1RfwsASdMWIiJxggiLwMlXfwy3cLMc0WPIMTxVDWS7R0T1dHCO0bHgAAUPQAW3+MwrDIgd3zjfov1oxVEVAKYszcYC9RcfxuL3TxDQpGDllVWtDmSekEnE+SyEwmTzzk9CyCUqhVNgdSME0ijYyohN9MnIzEHcY1OJYlw1i8BZ-ENPI5myVwCWSSJghzdy-KkltsJ8y92AwYhIDCwdYzFKUZTlcdfyVWKECyMkIIgikKSxPFCTiOK83VYJ-EsnV6XYriiv9TzpLPdsKt5arBXIBSFJUcgwyjAA1PRovo9qdXXTw1jG-FXDxSkoIiGDgjghIxtAlj4tmySvMW3CsAgf5+Rq186tFCVpVlQ62rsOKCuYlZqVA5LS2pVc8Q3CCl2ydNcWpJwipBNAqB4MMrHqFBXTEWxbyEDg0AAM34D0AAow30cgRXUPQpHIABNABKMQGxQPGCbIImMBJmKfzoiHjIpZiQj1dYENNAlDRJZLmP1U1ghcHr-AZdyadIX6ReJggyd4CNenBwzIYQBZ3FnasQm8VwEIs1XFjJalvfWDEsTu9yaBeGh8aIlhRfFsQxTDPQZH29ndpkGOVBkXoJBDa3-ytMtcyXXIjnYw5IlVlz5jOvNSyObxfAiIrTdJngxDDGNej0HaxyTKWbamBx121h6LScNZXEV1W8zRFi8zCCz8yydywFsPBMCgHg1DAXCZAwGmWDEKjm96VudszqcrTcfISULJYknTVW9w8U16TyQscwyefF9wZfV-XjtN+3sQ9AABphgUOQXocg9DqBjAdFqXd-wOBYqkPwes9ShF8MkZKNkhp2zyOudMJZuK5j4hEFCNoGwvG9GAAA7jwLAxAICkW2jHBSqgGqg2ap3AycDIjkjCJWUIeIQK5ENAkR+WA-CYhLDrFi6R3LkOqtQsgWBYBgBBA3Mgu0UBiF4BzNuqhdphmPu1FEYj8qmipEQvKwi9RzBRFkCyIjKxJFkd-KhNDlGqLvBopuoCY5SEMbbYSHgcjJVNOxJIm5hGiPEbwqRd0iikLtHI1xij3Fmx4F4-aIoZASC5ltXoagVDaP0DtFQ+j-FTGpGWK0uoRHxVyLMSCWCWJD3JONQ42sdbn2cRQhRUAlG8mNlADJYYtphiYUoDuktOFTh8GiQ4QQlhCTQaWYRAQsrpD1DMNKY0SEXHKEk3p-SMCDOGcDAAUroyZE4jq2wcLMdU40fAFVJAJfEXFVm1g3BsyI6YLI7O6fImhaAUC+hoPTQUVEmCaF4OU4kYQPAanyHrGkoFDRWgxKkTwYQ8QkjWDXAFyS+noDBcIYWUBJTKKoDISqFh+CxEkNtCBag9ATPbt+a50sVQMjEViSsfEFihHdk05p8xqSHDQQcfU7gCWHOJSIMlFKPTUt5LS+lltfGwunExGuaxPY6gEY07YLFSQwzGskQIOsOKvwSfslxhzPQemIDTWIPBlUYFVWITJ2Sk7hUKZKMZMoYUwOme1VUGYGnrBLCWBCvhVnENGjMbWVJ6QPRlTQh1BNnWuppeYelXqJA+qBhIcgMgaLBollMM6ZIRGcXWCsDEFJMFGuyA7FErgrSkm1hBNNijSCejQHQOhbqPXqo5pq0C2q7rxRyPqltVjCxiMFb7P5yRdm2ltT0mhfaB1DpzXSqOLKRS5IjMwyUYpNU6jmHdXMhZHk1z4sIriMFKTjTQVxa99Ie1EpeKedRjrDb-QUi8ZR7qsKhV2ptMMYpIxXNat3RIgE0EFm8LWkkFI41lixmsbKxr4l7OwAcxuo6-HlpuVMJ+XyalPStFW2NWCdbsXVPkHMKUOJYjXWQu1jdIXQs1XxU6qpKylh1JSIeqtVRzOY3OLcHEOOJK42QMQkoFJqBg8DcgvAYzju5YlLwoma46sNcSHBQEKwEIZAZr9u9ND70PuwqZFbEA5CyqqfMFrSRBGiPRiTTGcxpELjPPD67sC-VQPXcF1neBQt4EGjhjmEBnUw65mpFICoCTHmgmGU9b2z1rja7A27B0Qs0NF2LDmyOOBCGIvlgQazLCnqrZ68xtaRAWRZaV+WtFQb0H0FQugz2at7m4c0mI0jGoZGNIzCAHDLH4iSA4KxVRhBYuJLrYpevpzDJKMrHL4MJfxBuOcpoX1zn1F57YM3411IW285beWbQYEaPAYYDZSDAosA6wbesYZq0nq4SIepDS9z7hsOc2p6Qifeg6Go9x6iPE7A6HsohNV-I8IWO6HFfkrGyLZNEuoqSlmugIgIUP2Qw65PDq8BFbxhz+ACZ8mrMQwXxAyMxiw+KDW2EucklJiGolAtWS6pOeDk4eI0LAvJ-oQE1QyFIW40jZDWCxWsmwmmhHvgcMxXgwfWvwx5DktQxfsBR1uNHywkicQWNjptjhsiYtCBiJ6pYcwlmF-NUqbpyoI-ZEj57cWKvTatOSERllaxLhCHrLFhoX2pDRhBU+tTdfBf159MqS08LXkIt8Fgj5-rjq4kBEPqwZg5nYnR7YWL1wCT4jXfOLz-Bu5KmB2Sl5ioBSCiFfPex5bxUrCiJ6U3cx9wrLWBcBUZH5ZTwtNP31KqrU1XwuWpYTineSDxLBJYyTVxjbkKjjfU+e-Tz9P6z5pekc5R1XM8xsxDz1HOa+0fxqx63PH7Wif9-T8P7hQbdvMzZhvasIWAaFgsQn3GjEkKBO0mEB1nroLGAKHCbGLGkhDLtv+JhpIq4AUMQmNEIlgnrF1C-kPLSKiNSAbEbITOFjcqgQxFmFgDXMlNrFxAVOxFNiSCasJndFxHrP1G5JPkHGACHGSj8BHGbJqtSA7BiHOHdGkMJkuB7DOIcMBEuIEKvnXEgWolAD-uuEkEEGguPA0viCXBZEEmsMQn7JZH4G-EvGQF-BvFvCwINnOOqCPDmAyBBBjLfPCjqAJGYVNNrF+rQvQmADLnMNRmkHxOsPNkKkaosGiHmHiImpfGDgEakhoRomIZOkPJWKNrNpiI+nbuNONLwhxKSHqCkQMukigOOkxJqAEKdvHkPA+k0gyDBHUUlJiNPAEcCqCuCijk9GjoEKsLzhNOvkaqWM+tWKJIcFuPkAES8AAFZmyQCDYF57gLBsa36RDpRNLirkiTExq4hW44yT6EaKJ8jehQC-r3gsAKAsDKTBHn57YLAwS1hbGTQ9QC5ooCp0E6xYpjTx5HByYbqAqKJyqko8CKpUp7rbD+4X4oitoMYYjZBnQcQ247BPRMTLC1iWRg63owHJ6nF9IZpOoupkDDq5qM4CSpC6r5QHA4JWLfZtq4rjSJoYgBGFa7oqoUmPH-j5QayebiK4ajGJDHbkiCqqhpD+a8F66Ek4A-qeL-rECAbAYqpgaap+DrjmReCcSv5omiTrhYYkFLBhB5YykKaaE8lTgOA5g8IljagCJDy4HbAWSyzxGUjeFXzSnJ6hYoDhbLGWlGIzg14gRPSYiBC3xUgmivJDxHZPzuQcln6wl7bWl7CzBORoI6wIS1iqygQOyKFUjTTELV7iSDZpQ-Zv4rD-bsRonwIiIeDzb6jJpYqBD3aFBAA */
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
                src: 'createSignedVp',
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

        verifyIdentity: () => async (callback) => {
          // TODO: use SDK verify identity
          const sdkVerify = () => Promise.resolve(true);

          const result = await sdkVerify();
          if (result) {
            callback(ScanEvents.VERIFICATION_SUCCESS());
          } else {
            callback(ScanEvents.VERIFICATION_FAILED());
          }
        },

        createSignedVp: (context) => async (callback) => {
          // TODO: create and sign Verifiable Presentation
          const challenge = '???';
          const vp = await createVerifiablePresentation(
            context.selectedVc.verifiableCredential,
            challenge
          );
          callback(ScanEvents.VP_CREATED(vp));
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

export function selectIsInvalidIdentity(state: State) {
  return state.matches('reviewing.invalidIdentity');
}
