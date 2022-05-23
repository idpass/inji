import { Camera, FaceDetectionResult } from 'expo-camera';
import { CameraType, Face } from 'expo-camera/build/Camera.types';
import { Image } from 'expo-face-detector';
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
    },
  }
);

export const FaceScannerEvents = model.events;

export interface FaceScanResult {
  metadata: Face;
  image: Image;
}

export const faceScannerMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QDMCGBjMBldqB2eYATgHQCWeZALgMQBKAogIIAiAmoqAA4D2s1ZHnk4gAHogC0ANikkAHAAYpAJgCsARgDMAFmUB2TVLlSANCACeiLavm7te+yr0BOBQ4C+7s2kw58hUlhcAgooEh8wADEeAFc8CBoIITByPAA3HgBrFIi-AmISIP9Q8Iwo2PiECgzcKkE8AG0FAF0RXn46oRFxBAltZxJNVQUlOTk9PWG5Z2czSwQ9ZW0SbRlnbTllTSXnZWVPbzK8gMLgyjwwiOi4hOIiHlIuABtUKmQHgFtS3zOCopCLt9yjcqukeLV6k1WkgQO0BF0YT11M4bM5NMj1Oo5Kp0coFNi5ohVLp5CNVM5JnJ1EYJgcQLlfoEzqEaJEADIASQACgB9ADCTAAsgw6Ew2nx4cJEVZVHoSAptNp1BNNIZJttlISENZbEsHHonK4PF56UdGadihdWUw+QweSwGAAVBh850scUderdSSaPQKEhSVRSClSJTOOT9bRatUkP1jTRKdFJoOeE14HgQOAiBn+AoUageyXe3qykhoybqJZuLZUrVqQbKobTTbE-qaOk5-JMy2XMrXeKFzpS0A9aRyMtYqnIhR4lRBrU4-0JhTkynU8Z6Dtm3PdgG9zCOng8SKoIiDr3S3p+lahvTrg3bW-RiMkPHxvQRxa7KRbn47i17ueCIjj66wBkGIZhhG6x1pssb4nI6KLJW+hKL+2DmmQHyoDAfKoFwVAxEQkBAcOYiSMMJDqCMShBm4Bqflq4yyM4wbOOoQYqP0yhyOhxzEKRxZ9Fi4HBgaUGRlqfRykYyhSJoMz6MSHE-qmQA */
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
          on: {
            READY: {
              actions: 'setCameraRef',
              target: 'scanning',
            },
          },
        },
        scanning: {
          initial: 'faceTooFar',
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
            faceTooFar: {
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
                target: '.faceTooFar',
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
      },
      services: {
        // monitorCapabilities: () => (callback) => {},
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

export function selectIsScanning(state: State) {
  return state.matches('scanning');
}

export function selectIsFaceTooFar(state: State) {
  return state.matches('scanning.faceTooFar');
}

export function selectIsFaceFound(state: State) {
  return state.matches('scanning.faceFound');
}

export function selectIsImageCaptured(state: State) {
  return state.matches('imageCaptured');
}
