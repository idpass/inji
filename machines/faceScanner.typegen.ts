// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  'eventsCausingActions': {
    setCameraRef: 'READY';
    openSettings: 'OPEN_SETTINGS';
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
    checkPermission: 'done.invoke.faceScanner.init.checkingPermission:invocation[0]';
    requestPermission: 'done.invoke.faceScanner.init.requestingPermission:invocation[0]';
    captureImage: 'done.invoke.faceScanner.scanning.faceFound:invocation[0]';
  };
  'missingImplementations': {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  'eventsCausingServices': {
    checkPermission: 'APP_FOCUSED';
    requestPermission: 'DENIED';
    captureImage: 'FACE_DETECTED';
  };
  'eventsCausingGuards': {
    canRequestPermission: 'DENIED';
    isOutOfBounds: 'FACE_DETECTED';
  };
  'eventsCausingDelays': {};
  'matchesStates':
    | 'init'
    | 'init.checkingPermission'
    | 'init.permissionDenied'
    | 'init.permissionGranted'
    | 'init.requestingPermission'
    | 'scanning'
    | 'scanning.faceFound'
    | 'scanning.faceNotFound'
    | 'imageCaptured'
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
