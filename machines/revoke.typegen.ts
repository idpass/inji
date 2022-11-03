// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  'internalEvents': {
    'done.invoke.RevokeVids.acceptingVIDs.requestingOtp:invocation[0]': {
      type: 'done.invoke.RevokeVids.acceptingVIDs.requestingOtp:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'error.platform.RevokeVids.acceptingVIDs.requestingOtp:invocation[0]': {
      type: 'error.platform.RevokeVids.acceptingVIDs.requestingOtp:invocation[0]';
      data: unknown;
    };
    'xstate.init': { type: 'xstate.init' };
  };
  'invokeSrcNameMap': {
    fetchVIDs: 'done.invoke.RevokeVids.fetchVIDs:invocation[0]';
    requestOtp: 'done.invoke.RevokeVids.acceptingVIDs.requestingOtp:invocation[0]';
    requestRevoke: 'done.invoke.RevokeVids.requestingRevoke:invocation[0]';
  };
  'missingImplementations': {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  'eventsCausingActions': {
    clearOtp:
      | 'DISMISS'
      | 'ERROR'
      | 'REVOKE_VCS'
      | 'SET_VIDS'
      | 'done.invoke.RevokeVids.acceptingVIDs.requestingOtp:invocation[0]';
    logRevoked: 'STORE_RESPONSE';
    removeVIDs: 'STORE_RESPONSE';
    revokeVID: 'SUCCESS';
    setFetchedVIDs: 'SET_VIDS';
    setIdBackendError: 'error.platform.RevokeVids.acceptingVIDs.requestingOtp:invocation[0]';
    setOtp: 'INPUT_OTP';
    setOtpError: 'ERROR';
    setTransactionId: 'DISMISS' | 'REVOKE_VCS' | 'SET_VIDS';
    setVIDs: 'REVOKE_VCS';
  };
  'eventsCausingServices': {
    fetchVIDs: 'FETCH_VIDs';
    requestOtp: never;
    requestRevoke: 'INPUT_OTP';
  };
  'eventsCausingGuards': {};
  'eventsCausingDelays': {};
  'matchesStates':
    | 'acceptingOtpInput'
    | 'acceptingVIDs'
    | 'acceptingVIDs.idle'
    | 'acceptingVIDs.requestingOtp'
    | 'fetchVIDs'
    | 'idle'
    | 'invalid'
    | 'invalid.backend'
    | 'invalid.otp'
    | 'loggingRevoke'
    | 'requestingRevoke'
    | 'revokingVc'
    | { acceptingVIDs?: 'idle' | 'requestingOtp'; invalid?: 'backend' | 'otp' };
  'tags': never;
}
