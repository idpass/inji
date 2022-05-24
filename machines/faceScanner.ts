import { Camera, FaceDetectionResult, PermissionResponse } from 'expo-camera';
import { CameraType, Face } from 'expo-camera/build/Camera.types';
import { Image } from 'expo-face-detector';
import { Linking } from 'react-native';
import { assign, EventFrom, StateFrom } from 'xstate';
import { createModel } from 'xstate/lib/model';

const model = createModel(
  {
    cameraRef: {} as Camera,
    faceBounds: {
      minWidth: 280,
      minHeight: 280,
    },
    whichCamera: Camera.Constants.Type.front as CameraType,
    face: {} as FaceScanResult,
    captureError: '',
  },
  {
    events: {
      FACE_DETECTED: (result: FaceDetectionResult) => ({ result }),
      READY: (cameraRef: Camera) => ({ cameraRef }),
      FLIP_CAMERA: () => ({}),
      DENIED: (response: PermissionResponse) => ({ response }),
      GRANTED: () => ({}),
      OPEN_SETTINGS: () => ({}),
      APP_FOCUSED: () => ({}),
    },
  }
);

export const FaceScannerEvents = model.events;

export interface FaceScanResult {
  metadata: Face;
  image: Image;
}

export const faceScannerMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QDMCGBjMBldqB2eYATgHQCWeZALiegBZjoDWFUACsQLZmyxkD2eAMQARAKIA5AJJiRiUAAd+fKgLzyQAD0QBaAIwAmAyQMBWAJwBmABzWADHoAslywfOOANCACeu0wHYANhJ-R389SzC3QJjLAF84rzRMHHxCUgpqWgZmVg4ibl41IQBxACUAQQkAFVkNJRU1DW0EHUc7YxtA6z09c2sza3NzQK9fVtdjO0s7fqHrAL1-U0CEpIxsXAJickoaBS4ePkERMEpIIQB5NkkAfSwxauqpCRKseuVqJqQtXW6Q6aGbrWGymIzWMa6AwzEiOCwrZwzbp6QL+NYgZKbNI7TL7Q5FE5nMgXCpsNi3ABilwAwgBVB5yH4NL6CZpQ-zGazhQKmUwdSIGVGQiZGEjTWahIYGOx2azOdGY1LbDJ7EhEMAARwArnBVHh2PjjsJylVaozFJ9VKyfi03I4TJFHI4YqYFkEucL9JY9LC9GDxX7zAYQQqNkr0rssurtbq8obiuJpHUmZbvqAWkt7Y5g45ek7A4EnZ7JmLvQ4ZbKrI5zGjEhiw1sI7ihGUxBURABND6Na3pvzBfwclzWQs80y9CE+RBTexcwWy8eFlyhlKNnawRusEiYin8LV4CBCCCCMC7ABu-CYp8Va9IG7SW53e4PCAoF9wVrwAG07ABdbssuoNq6JY5gkN6gSGCiIJ6HYoTLMKrrGMssH2P4lj+HYzp6CuWLKiQ94EI+Gy7vuh7EEQ-CkAoAA2qBUMgVGcNuDbYnem76ixmCkS+b78B+ag-v+KY9kBfYINKpgkCMrpOg42auIEljCu0PqymEMyyoEBi5qsdY3mxBEcVAQgUgAMlI5LUhUACyYiVABn5sggegLCE-gDCCBiDjWIL+MKM6yhygQLiiiK4eG67GaZFTUmItziLU1Jmo5aa-BMIUkNpMzOOYQUYaMU4SWY0lBiM3qWK6qKOAkdZ4PwEBwBoBn4bi2SMCw+r5IURqpb26VtHYwQYUOSlWEYNieiF1ghGEhg1g47jLvprGtaqBwFEcainOcEB9WJA3mD6fIVQYfozNKLjFsGJCmDMIxLTl47xCtq6GW1G09WoJREPgVCQPtzmDfaGEYQMvJOpYSmehE-jSX6rmQdM7gRNYEW3pGNDRjqsB6gam0EgdzJOcBLkeSE0odIO-go3B-lFTorqWCYc2RA4yxBAY6PvXsgOk20MIjdCY2TJNDPIrN4TBpB0puOY3P4YRlCcU+ZF8+JjMzbYjhcjW7TmHyQTCjYM2yehMojjpKIKxGSvEZgEj8FQPF7SJgFA5l2aonK4Rgk43mmAF2awmVmGVa5zpwjbUUPvq6sDTY9rZVhoH5UbRVOHYpXRNmZgebMXOvXhTacKgMDUqgChUFq6quxaolA+0YoxAjbgjrYRjCuhUlmO0Osophzq1usb3KvHLRtKYIODsLoGi5O4w6Ms9rwYYyxGL0ha1XEQA */
  model.createMachine(
    {
      tsTypes: {} as import('./faceScanner.typegen').Typegen0,
      schema: {
        context: model.initialContext,
        events: {} as EventFrom<typeof model>,
      },
      id: 'faceScanner',
      initial: 'init',
      states: {
        init: {
          initial: 'checkingPermission',
          states: {
            checkingPermission: {
              invoke: {
                src: 'checkPermission',
              },
              on: {
                DENIED: [
                  {
                    cond: 'canRequestPermission',
                    target: 'requestingPermission',
                  },
                  {
                    target: 'permissionDenied',
                  },
                ],
                GRANTED: {
                  target: 'permissionGranted',
                },
              },
            },
            permissionDenied: {
              on: {
                OPEN_SETTINGS: {
                  actions: 'openSettings',
                },
                APP_FOCUSED: {
                  target: 'checkingPermission',
                },
              },
            },
            permissionGranted: {},
            requestingPermission: {
              invoke: {
                src: 'requestPermission',
              },
              on: {
                GRANTED: {
                  target: 'permissionGranted',
                },
                DENIED: {
                  target: 'permissionDenied',
                },
              },
            },
          },
          on: {
            READY: {
              actions: 'setCameraRef',
              target: 'scanning',
            },
          },
        },
        scanning: {
          initial: 'faceNotFound',
          states: {
            faceFound: {
              invoke: {
                src: 'captureImage',
                onDone: [
                  {
                    actions: 'setFaceImage',
                    target: '#faceScanner.imageCaptured',
                  },
                ],
                onError: [
                  {
                    actions: 'setCaptureError',
                  },
                ],
              },
            },
            faceNotFound: {
              description:
                'For accurate consistent results user must be facing the camera and have it close to their face.',
            },
          },
          on: {
            FLIP_CAMERA: {
              actions: 'flipWhichCamera',
            },
            FACE_DETECTED: [
              {
                cond: 'isOutOfBounds',
                target: '.faceNotFound',
              },
              {
                actions: 'setFaceMetadata',
                target: '.faceFound',
              },
            ],
          },
        },
        imageCaptured: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        setCameraRef: model.assign({
          cameraRef: (_context, event) => event.cameraRef,
        }),

        flipWhichCamera: model.assign({
          whichCamera: (context) =>
            context.whichCamera === Camera.Constants.Type.front
              ? Camera.Constants.Type.back
              : Camera.Constants.Type.front,
        }),

        setFaceMetadata: model.assign({
          face: (context, event) => ({
            ...context.face,
            metadata: event.result.faces[0],
          }),
        }),

        setFaceImage: assign({
          face: (context, event) => ({
            ...context.face,
            image: event.data as Image,
          }),
        }),

        setCaptureError: assign({
          captureError: '',
        }),

        openSettings: () => Linking.openSettings(),
      },

      services: {
        checkPermission: () => async (callback) => {
          const result = await Camera.getCameraPermissionsAsync();
          if (result.granted) {
            callback(FaceScannerEvents.GRANTED());
          } else {
            callback(FaceScannerEvents.DENIED(result));
          }
        },

        requestPermission: () => async (callback) => {
          const result = await Camera.requestCameraPermissionsAsync();
          if (result.granted) {
            callback(FaceScannerEvents.GRANTED());
          } else {
            callback(FaceScannerEvents.DENIED(result));
          }
        },

        captureImage: (context) => {
          return context.cameraRef.takePictureAsync({ base64: true });
        },
      },

      guards: {
        isOutOfBounds: (context, event) => {
          const { faces } = event.result;
          if (faces.length > 0) {
            const { width, height } = faces[0].bounds.size;
            return (
              width < context.faceBounds.minWidth ||
              height < context.faceBounds.minHeight
            );
          }
          return false;
        },

        canRequestPermission: (_context, event) => {
          return event.response.canAskAgain;
        },
      },
    }
  );

type State = StateFrom<typeof faceScannerMachine>;

export function selectWhichCamera(state: State) {
  return state.context.whichCamera;
}

export function selectFace(state: State) {
  return state.context.face;
}

export function selectIsPermissionGranted(state: State) {
  return state.matches('init.permissionGranted');
}

export function selectIsScanning(state: State) {
  return state.matches('scanning');
}

export function selectIsFaceNotFound(state: State) {
  return state.matches('scanning.faceNotFound');
}

export function selectIsFaceFound(state: State) {
  return state.matches('scanning.faceFound');
}

export function selectIsImageCaptured(state: State) {
  return state.matches('imageCaptured');
}
