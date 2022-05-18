// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  'eventsCausingActions': {
    openSettings: 'LOCATION_REQUEST';
    setConnectionParams: 'SCAN';
    setSenderInfo: 'RECEIVE_DEVICE_INFO';
    setReceiverInfo: 'EXCHANGE_DONE';
    setReason: 'UPDATE_REASON';
    setSelectedVc: 'SELECT_VC';
    setVerifiablePresentation: 'VERIFICATION_SUCCESS';
    signVerifiablePresentation: 'VERIFICATION_SUCCESS';
    setVerificationImage: 'IMAGE_CAPTURED';
    removeLoggers:
      | 'SCREEN_BLUR'
      | 'xstate.after(CLEAR_DELAY)#scan.clearingConnection'
      | 'CANCEL'
      | 'DISMISS';
    requestToDisableFlightMode: 'FLIGHT_REQUEST';
    requestToEnableLocation: 'LOCATION_DISABLED' | 'LOCATION_REQUEST';
    disconnect: 'LOCATION_ENABLED';
    registerLoggers:
      | 'xstate.after(CLEAR_DELAY)#scan.clearingConnection'
      | 'CANCEL'
      | 'DISMISS';
    requestSenderInfo: 'SCAN';
    clearReason: 'xstate.init';
    logShared: 'VC_ACCEPTED';
  };
  'internalEvents': {
    'xstate.after(CLEAR_DELAY)#scan.clearingConnection': {
      type: 'xstate.after(CLEAR_DELAY)#scan.clearingConnection';
    };
    'xstate.init': { type: 'xstate.init' };
  };
  'invokeSrcNameMap': {
    checkAirplaneMode: 'done.invoke.scan.checkingAirplaneMode:invocation[0]';
    checkLocationStatus: 'done.invoke.scan.checkingLocationService:invocation[0]';
    checkLocationPermission: 'done.invoke.scan.checkingLocationService.checkingPermission:invocation[0]';
    discoverDevice: 'done.invoke.scan.connecting:invocation[0]';
    exchangeDeviceInfo: 'done.invoke.scan.exchangingDeviceInfo:invocation[0]';
    sendVc: 'done.invoke.scan.reviewing.sendingVc:invocation[0]';
    verifyIdentity: 'done.invoke.scan.reviewing.verifyingIdentity:invocation[0]';
    captureImage: 'done.invoke.scan.reviewing.capturingImage:invocation[0]';
  };
  'missingImplementations': {
    actions: 'signVerifiablePresentation' | 'setVerificationImage';
    services: 'captureImage';
    guards: never;
    delays: never;
  };
  'eventsCausingServices': {
    checkAirplaneMode: 'SCREEN_FOCUS';
    checkLocationStatus: 'FLIGHT_DISABLED';
    checkLocationPermission: 'LOCATION_ENABLED' | 'APP_ACTIVE';
    discoverDevice: 'RECEIVE_DEVICE_INFO';
    exchangeDeviceInfo: 'CONNECTED';
    sendVc: 'SELECT_VC' | 'VERIFICATION_SUCCESS';
    captureImage: 'CAPTURE_IMAGE';
    verifyIdentity: 'IMAGE_CAPTURED';
  };
  'eventsCausingGuards': {
    isQrValid: 'SCAN';
  };
  'eventsCausingDelays': {
    CLEAR_DELAY: 'xstate.init';
  };
  'matchesStates':
    | 'inactive'
    | 'checkingAirplaneMode'
    | 'checkingAirplaneMode.checkingStatus'
    | 'checkingAirplaneMode.requestingToDisable'
    | 'checkingAirplaneMode.enabled'
    | 'checkingLocationService'
    | 'checkingLocationService.checkingStatus'
    | 'checkingLocationService.requestingToEnable'
    | 'checkingLocationService.checkingPermission'
    | 'checkingLocationService.denied'
    | 'checkingLocationService.disabled'
    | 'clearingConnection'
    | 'findingConnection'
    | 'preparingToConnect'
    | 'connecting'
    | 'exchangingDeviceInfo'
    | 'reviewing'
    | 'reviewing.idle'
    | 'reviewing.selectingVc'
    | 'reviewing.sendingVc'
    | 'reviewing.accepted'
    | 'reviewing.rejected'
    | 'reviewing.navigatingToHome'
    | 'reviewing.capturingUserIdentity'
    | 'reviewing.verifyingIdentity'
    | 'reviewing.capturingImage'
    | 'reviewing.invalidIdentity'
    | 'disconnected'
    | 'invalid'
    | {
        checkingAirplaneMode?:
          | 'checkingStatus'
          | 'requestingToDisable'
          | 'enabled';
        checkingLocationService?:
          | 'checkingStatus'
          | 'requestingToEnable'
          | 'checkingPermission'
          | 'denied'
          | 'disabled';
        reviewing?:
          | 'idle'
          | 'selectingVc'
          | 'sendingVc'
          | 'accepted'
          | 'rejected'
          | 'navigatingToHome'
          | 'capturingUserIdentity'
          | 'verifyingIdentity'
          | 'capturingImage'
          | 'invalidIdentity';
      };
  'tags': never;
}
