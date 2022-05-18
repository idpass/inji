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
    verifiablePresentation: {} as VerifiablePresentation,
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
      CAPTURE_IMAGE: () => ({}),
      RETRY_CAPTURE: () => ({}),
      IMAGE_CAPTURED: (image: CameraCapturedPicture) => ({ image }),
      VERIFICATION_FAILED: () => ({}),
      VERIFICATION_SUCCESS: () => ({}),
    },
  }
);

export const ScanEvents = model.events;

export const scanMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5SwMYEMB2A6FALMKA1gJYZQCCxATgA4A2mYAsgPYRg75GlQDKALmn4BXWAGIAYgBkAkgHEAEgBUA+gBEZvcgCEpAUTWJQNFrGL9iLDEZAAPRAFoALAEYsANgCsLpwHYAnC7uAAzuAZ4AzAA0IACeiABMThFYwQk+AByensEZLgEuAL6FMaiYnAQkZJS0DBjMbBx4lTwCQqKSsoqqegByOvqGSCAmZhZWNvYIEREZWC4u2S4ROQnusy4x8QjpKT7rGf5JrslpxaXo2M3c1dT0jKzsWFRgAI7CcBZkSixqxLBoABGdDAnXkynUmgGBhso3MlmswymTgyTnmCV87iOgQywU8GQSW0QLmCwSw-ic-gigRCQQSnip5xAZSuXCqFDudQaTzAGCBIIgYO6KgASnoAIoAVT0vCUsNM8ImSMQGWpWCyfgWuPcTicnicRJ2y3mTgOR11PgiZxKzMuFRuUCkLHQ4wwvDAVAAbsQUE02a1BCJxFIAPIAYXIShkId6Kj60KGxgVrsmjgibgJCSpvl8nlzaV8PkNvgyvlS+Qymd8pP8BKZLPt7KdLoR7q9Pr9LTIbSDYlDEajMchWl0MOGcJTyp2h3Vvizepp7gJWUNOU8WHx7iX+YCWIp9bt1ybzqErY93t9zzeH1gXygPz0fOBoP7kejsfjo8TI2TCNTO0CLBZn1BI8i1DJ3ENLEEg3FF038UJKwWXwD3KI8eGbU8rDbC8OBed5Ph4B8nxBPtwzfIcNBHQZ5TGP8p1RfwsASdMWIiJxggiLwMlXfwy3cLMc0WPIMTxVDWS7R0T1dHCO0bHgAAUPQAW3+MwrDIgd3zjfov1oxVEVAKYszcYC9RcfxuL3TxDQpGDllVWtDmSekEnE+SyEwmTzzk9CyCUqhVNgdSME0ijYyohN9MnIzEHcY1OJYlw1i8BZ-ENPI5myVwCWSSJghzdy-KkltsJ8y92AwYhIDCwdYzFKUZTlcdfyVWKECyMkIIgikKSxPFCTiOK83VYJ-EsnV6XYriiv9TzpLPdsKt5arBXIBSFJUcgwyjAA1PRovo9qdXXTw1jG-FXDxSkoIiGDgjghIxtAlj4tmySvMW3CsAgf5+Rq186tFCVpVlQ62rsOKCuYlZqVA5LS2pVc8Q3CCl2ydNcWpJwipBNAqB4MMrHqFBXTEWxbyEDg0AAM34D0AAow30cgRXUPQpHIABNABKMQGxQPGCbIImMBJmKfzoiHjIpZiQj1dYENNAlDRJZLmP1U1ghcHr-AZdyadIX6ReJggyd4CNenBwzIYQBZ3FnasQm8VwEIs1XFjJalvfWDEsTu9yaBeGh8aIlhRfFsQxTDPQZH29ndpkGOVBkXoJBDa3-ytMtcyXXIjnYw5IlVlz5jOvNSyObxfAiIrTdJngxDDGNej0HaxyTKWbamBx121h6LScNZXEV1W8zRFi8zCCz8yydywFsPBMCgHg1DAXCZAwGmWDEKjm96VudszqcrTcfISULJYknTVW9w8U16TyQscwyefF9wZfV-XjtN+3sQ9AABphgUOQXocg9DqBjAdFqXd-wOBYqkPwes9ShF8MkZKNkhp2zyOudMJZuK5j4hEFCNoGwvG9GAAA7jwLAxAICkW2jHBSqgGqg2ap3AycDIjkjCJWUIeIQK5ENAkR+WA-CYhLDrFi6R3LkOqtQsgWBYBgBBA3Mgu0UBiF4BzNuqhdphmPu1FEYj8qmipEQvKwi9RzBRFkCyIjKxJFkd-KhNDlGqLvBopuoCY5SEMbbYSHgcjJVNOxJIm5hGiPEbwqRd0iikLtHI1xij3Fmx4F4-aIoZASC5ltXoagVDaP0DtFQ+j-HGQZFgQsrFSx8JrnqYRVoUghFCIXHIJCLjlCSQoqASjeTGygBksMW0wxMKUB3SWnCpw+DRIcIISwhJoNLMIgIWV0h6hmGlMaHTbRdJcT0vpGABlDOBgAKV0RMicR1bYOFmOqcaPgCqkgEviLiKzawbnWZEdMFltnOIoQctAKBfQ0HpoKKiTBNC8HKcSMIHgNT5D1jSUChorQYlSJ4MIeISRrBrv8+RND0CguEMLKAkplFUBkJVCw-BYjeOYZKMUKcmDkHATChAAkyzJUxL8u6c4ZjCMRRuasZ0CQ6lRGJBJeyAU0M9B6YgNNYg8CpbyGldLMnZKTuFQpkpRkymhTAqZ7U7qzJJKqOGSQ8i6hWSSe+1YVgcXGrWHGUrsDdNlfKxVyrqXmHVXoLJEgtVAwkOQGQNFDUS2RAEEx9JfZYlVJsLBj80QrErMkQ4oFCwus6W6-ZhK0DEtJTIZSaAYBiBkCy8BKgIwMrFN+K50sVR+A8F4LwFJtbZ0GtsJIT14U10RosZYkR8XJN6aQT0aA6B0JVRgNV3jei+PZekJi8yqTBJCHOM6Vj0jkg1HdeK1i0EjoOeOyd06fW0qjnoJQIpck1qUIy6BHDI2IEpGWcaAl22YpzEuaISauIwUpONTFIj0xnWPY3S2i6I3XKmE-T5uoRGcQGgVVWqpTU5jnFuDiWIdlkLzWQXemhIW8ANc+2DiA+KnVVJWUsOpKRDzQ+xdU+QcwpQ4nhxJBGoBiElApNQkYIFinILwGM7KmnkgdSJBk+DMHbB1osICrHcgBBLM8iDhG94t10eynIWVVT5kCCSbW6wmMYerCxFEM94k5p+v8FA9cwVEd4CRsjkyX0IDOmWSsxDEPtsxF24k48YZT0LFR3ItdXW0IwBOqd4LiNQvZQ4EIYjKwPJrEOzEqtnrzG1pEeZFl3DiS0WGMUfQVC6EZUl7w5IkiYjSCxPECFLKGgcMsfiJIDipq4vy4rFsyuxnTmGSUbmG3d0QNkLKc5TRAc3ckVr7WPCddmN1sILFig2gwI0eAwwGykCBRYOVSW9YwzVpPVwkQGlYN7n3DYc5tSxt1O9B0NR7j1EeJ2B0PZRDst+R4apSROILBWNkWyaJdRUlLNdARARnvsle1yD7V4CK3jDn8AEz52UBdRgyMxiw+KBY5XMXqxDUSZrxKiOHPAEcPEaFgXk-0IC6apC2tI2Q1gsVrIm7toR74HDMV4e7r8ovFRp+9xov2tz-eWIDn5IO5OOGyBigqT18RzgrJxtCc0SpYTdOVT77Jvs7fI42hAtyyRHCzPGpcIQ9aYsNEB1IaMIKnxEUuKn81Sp66Wnha8hFvgsEfP9JdXEgIiL1mkGYOZ2K+FXF4Dwgka752ef4D3OvvI+48lAAKQUQoh72PLeKaaCShGLEr7WJZnUMhVzZ3ZEkHSfTKpnyqq12V8LlqWE4c3ZjFlxBuRFTzURDzciL7XjfvffV+hjgUbfczzGzEPPUc5r4O-Gk7rcLvtZu+F7Z4q4-ZK+mq+uTM2Zcz5gxEWLBxC+5oy8N8hYrhNdXCFoTRz1yxv-m85Ix-gRiFjSEVghHuqBvkPLSKiNSAbEbK-mLGkhDB-gxFmFUqxB2huuxJBFgsZl1JiHdFxHrP1CPrZkHGACHKSj8BHGbOJpZMxGxndGkHRkuB7DOIcMBEuIEHNnXDAWolAEfsxCPGguPLMNxCXBZEEmsMQn7JZH4G-EvGQF-BvFvCwElnOOqHwYQhBBjLfHCjqAJOIVNNrBpmOvQmALpnME9GinxOsJ1u7EmosGiHmHiDMAVIsPdgYX0h4ukigJQUgUPJWPVu1llv+krk6pZCWBxKSHqK4cokch4UukxJqKpo-OsEPHxMIgyDBAkXgluIWK4UCiCmCr9r2mEIEKsJSNSBvsIqWIBhZtWIcFuPkK4S8AAFZmyQBJah57gP6hCL6RDpRJqHDvoWYIRqbA7Zp15XgyqKJ8jehQCngB4KAsDKTGEwam4LAwS1g9GTQ9SZqooLBkiFhZC24u5HBP7jEEqKJEoiCkrkoegzpqpLo1xiJZgMh0ZnRDwK5Gj6jCrXTJS+bLiuFyoExepkC3G+rso6huAFR+C0E1xoLjTCK-p2q5AhBZhJCMhRburnEFqXHKolowBt5JAbi47pDVhoKISCrNr2HZC+y5izCuGnpxYgm0ria6hiIhAajxS1h8TLBWKFipaMQMh6xagEFjEYncHLHjZm45g8IljagCJDwAHya1hliUkCRdFgSjENhT4OacH5Hin-gohMR8S5jD4FRYjc6wos77D0hDzTZPzuT0l0JKF7CzBORoI6zNY8QYGgQOzMFUjTTEKfriRJZpSnZb4OqLDsTvHwIiJLaISTQITUieAbaFBAA */
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
                CAPTURE_IMAGE: {
                  target: 'capturingImage',
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
                  actions: [
                    'setVerifiablePresentation',
                    'signVerifiablePresentation',
                  ],
                  target: 'sendingVc',
                },
                VERIFICATION_FAILED: {
                  target: 'invalidIdentity',
                },
              },
            },
            capturingImage: {
              invoke: {
                src: 'captureImage',
              },
              on: {
                IMAGE_CAPTURED: {
                  actions: 'setVerificationImage',
                  target: 'verifyingIdentity',
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

        setVerifiablePresentation: model.assign({
          verifiablePresentation: () => {
            // TODO
            return {} as VerifiablePresentation;
          },
        }),
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
          // TODO
          const result = await Promise.resolve(true);
          if (result) {
            callback(ScanEvents.VERIFICATION_SUCCESS());
          } else {
            callback(ScanEvents.VERIFICATION_FAILED());
          }
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
