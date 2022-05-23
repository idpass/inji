// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  'eventsCausingActions': {
    setCameraRef: 'READY';
    flipWhichCamera: 'FLIP_CAMERA';
    setFaceMetadata: 'FACE_DETECTED';
    setFaceImage: 'done.invoke.faceScanner.scanning.faceFound:invocation[0]';
    setCaptureError: 'error.platform.faceScanner.scanning.faceFound:invocation[0]';
  };
  'internalEvents': {
    'done.invoke.faceScanner.scanning.faceFound:invocation[0]': {
      type: 'done.invoke.faceScanner.scanning.faceFound:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'error.platform.faceScanner.scanning.faceFound:invocation[0]': {
      type: 'error.platform.faceScanner.scanning.faceFound:invocation[0]';
      data: unknown;
    };
    'xstate.init': { type: 'xstate.init' };
  };
  'invokeSrcNameMap': {
    captureImage: 'done.invoke.faceScanner.scanning.faceFound:invocation[0]';
  };
  'missingImplementations': {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  'eventsCausingServices': {
    captureImage: 'FACE_DETECTED';
  };
  'eventsCausingGuards': {
    isOutOfBounds: 'FACE_DETECTED';
  };
  'eventsCausingDelays': {};
  'matchesStates':
    | 'init'
    | 'scanning'
    | 'scanning.faceFound'
    | 'scanning.faceTooFar'
    | 'imageCaptured'
    | { scanning?: 'faceFound' | 'faceTooFar' };
  'tags': never;
}
