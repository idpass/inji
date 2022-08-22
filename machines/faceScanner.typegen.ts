// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
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
    checkPermission: 'done.invoke.faceScanner.init.checkingPermission:invocation[0]';
    requestPermission: 'done.invoke.faceScanner.init.requestingPermission:invocation[0]';
  };
  'missingImplementations': {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  'eventsCausingActions': {
    flipWhichCamera: 'FLIP_CAMERA';
    openSettings: 'OPEN_SETTINGS';
    setCameraRef: 'READY';
    setCaptureError: 'error.platform.faceScanner.scanning.faceFound:invocation[0]';
    setFaceImage: 'done.invoke.faceScanner.scanning.faceFound:invocation[0]';
    setFaceMetadata: 'FACE_DETECTED';
  };
  'eventsCausingServices': {
    captureImage: 'FACE_DETECTED';
    checkPermission: 'APP_FOCUSED' | 'xstate.init';
    requestPermission: 'DENIED';
  };
  'eventsCausingGuards': {
    canRequestPermission: 'DENIED';
    isOutOfBounds: 'FACE_DETECTED';
  };
  'eventsCausingDelays': {};
  'matchesStates':
    | 'imageCaptured'
    | 'init'
    | 'init.checkingPermission'
    | 'init.permissionDenied'
    | 'init.permissionGranted'
    | 'init.requestingPermission'
    | 'scanning'
    | 'scanning.faceFound'
    | 'scanning.faceNotFound'
    | {
        init?:
          | 'checkingPermission'
          | 'permissionDenied'
          | 'permissionGranted'
          | 'requestingPermission';
        scanning?: 'faceFound' | 'faceNotFound';
      };
  'tags': never;
}
