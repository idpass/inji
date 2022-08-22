// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  'internalEvents': {
    'xstate.after(CLEAR_DELAY)#scan.clearingConnection': {
      type: 'xstate.after(CLEAR_DELAY)#scan.clearingConnection';
    };
    'xstate.init': { type: 'xstate.init' };
    'xstate.stop': { type: 'xstate.stop' };
  };
  'invokeSrcNameMap': {
    checkAirplaneMode: 'done.invoke.scan.checkingAirplaneMode.checkingStatus:invocation[0]';
    checkLocationPermission: 'done.invoke.scan.checkingLocationService.checkingPermission:invocation[0]';
    checkLocationStatus: 'done.invoke.scan.checkingLocationService:invocation[0]';
    createVerifiablePresentation: 'done.invoke.scan.reviewing.creatingVerifiablePresentation:invocation[0]';
    discoverDevice: 'done.invoke.scan.connecting:invocation[0]';
    exchangeDeviceInfo: 'done.invoke.scan.exchangingDeviceInfo:invocation[0]';
    sendVc: 'done.invoke.scan.reviewing.sendingVc:invocation[0]';
    verifyIdentity: 'done.invoke.scan.reviewing.verifyingIdentity:invocation[0]';
  };
  'missingImplementations': {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  'eventsCausingActions': {
    clearReason:
      | 'CANCEL'
      | 'DISCONNECT'
      | 'DISMISS'
      | 'SCREEN_BLUR'
      | 'SCREEN_FOCUS'
      | 'xstate.stop';
    disconnect:
      | 'CANCEL'
      | 'DISCONNECT'
      | 'DISMISS'
      | 'LOCATION_ENABLED'
      | 'SCREEN_BLUR'
      | 'SCREEN_FOCUS'
      | 'xstate.stop';
    logShared: 'VC_ACCEPTED';
    openSettings: 'LOCATION_REQUEST';
    registerLoggers:
      | 'CANCEL'
      | 'DISMISS'
      | 'xstate.after(CLEAR_DELAY)#scan.clearingConnection';
    removeLoggers:
      | 'CANCEL'
      | 'DISMISS'
      | 'SCREEN_BLUR'
      | 'xstate.after(CLEAR_DELAY)#scan.clearingConnection'
      | 'xstate.init';
    requestSenderInfo: 'SCAN';
    requestToDisableFlightMode: 'FLIGHT_REQUEST';
    requestToEnableLocation: 'LOCATION_DISABLED' | 'LOCATION_REQUEST';
    setConnectionParams: 'SCAN';
    setReason: 'UPDATE_REASON';
    setReceiverInfo: 'EXCHANGE_DONE';
    setSelectedVc: 'SELECT_VC' | 'VERIFY_AND_SELECT_VC';
    setSenderInfo: 'RECEIVE_DEVICE_INFO';
  };
  'eventsCausingServices': {
    checkAirplaneMode: 'APP_ACTIVE' | 'FLIGHT_ENABLED' | 'SCREEN_FOCUS';
    checkLocationPermission: 'APP_ACTIVE' | 'LOCATION_ENABLED';
    checkLocationStatus: 'FLIGHT_DISABLED';
    createVerifiablePresentation: 'VERIFICATION_SUCCESS';
    discoverDevice: 'RECEIVE_DEVICE_INFO';
    exchangeDeviceInfo: 'CONNECTED';
    sendVc: 'SELECT_VC' | 'VP_CREATED';
    verifyIdentity: 'FACE_DETECTED';
  };
  'eventsCausingGuards': {
    isQrValid: 'SCAN';
  };
  'eventsCausingDelays': {
    CLEAR_DELAY: 'LOCATION_ENABLED';
  };
  'matchesStates':
    | 'checkingAirplaneMode'
    | 'checkingAirplaneMode.checkingStatus'
    | 'checkingAirplaneMode.enabled'
    | 'checkingAirplaneMode.requestingToDisable'
    | 'checkingLocationService'
    | 'checkingLocationService.checkingPermission'
    | 'checkingLocationService.checkingStatus'
    | 'checkingLocationService.denied'
    | 'checkingLocationService.disabled'
    | 'checkingLocationService.requestingToEnable'
    | 'clearingConnection'
    | 'connecting'
    | 'disconnected'
    | 'exchangingDeviceInfo'
    | 'findingConnection'
    | 'inactive'
    | 'invalid'
    | 'preparingToConnect'
    | 'reviewing'
    | 'reviewing.accepted'
    | 'reviewing.capturingUserIdentity'
    | 'reviewing.creatingVerifiablePresentation'
    | 'reviewing.idle'
    | 'reviewing.invalidIdentity'
    | 'reviewing.navigatingToHome'
    | 'reviewing.rejected'
    | 'reviewing.selectingVc'
    | 'reviewing.sendingVc'
    | 'reviewing.verifyingIdentity'
    | {
        checkingAirplaneMode?:
          | 'checkingStatus'
          | 'enabled'
          | 'requestingToDisable';
        checkingLocationService?:
          | 'checkingPermission'
          | 'checkingStatus'
          | 'denied'
          | 'disabled'
          | 'requestingToEnable';
        reviewing?:
          | 'accepted'
          | 'capturingUserIdentity'
          | 'creatingVerifiablePresentation'
          | 'idle'
          | 'invalidIdentity'
          | 'navigatingToHome'
          | 'rejected'
          | 'selectingVc'
          | 'sendingVc'
          | 'verifyingIdentity';
      };
  'tags': never;
}
