// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  'eventsCausingActions': {
    setIntent: 'done.invoke.app.init.intent:invocation[0]';
    setAppInfo: 'APP_INFO_RECEIVED';
    requestDeviceInfo: 'REQUEST_DEVICE_INFO';
    spawnStoreActor: 'done.invoke.app.init.intent:invocation[0]';
    logStoreEvents: 'done.invoke.app.init.intent:invocation[0]';
    spawnServiceActors: 'READY';
    logServiceEvents: 'READY';
    forwardToServices: 'ACTIVE' | 'INACTIVE' | 'ONLINE' | 'OFFLINE';
  };
  'internalEvents': {
    'done.invoke.app.init.intent:invocation[0]': {
      type: 'done.invoke.app.init.intent:invocation[0]';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'xstate.init': { type: 'xstate.init' };
  };
  'invokeSrcNameMap': {
    checkIntent: 'done.invoke.app.init.intent:invocation[0]';
    getAppInfo: 'done.invoke.app.init.info:invocation[0]';
    checkFocusState: 'done.invoke.app.ready.focus:invocation[0]';
    checkNetworkState: 'done.invoke.app.ready.network:invocation[0]';
  };
  'missingImplementations': {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  'eventsCausingServices': {
    checkIntent: 'xstate.init';
    getAppInfo: 'READY';
    checkFocusState: 'xstate.init';
    checkNetworkState: 'xstate.init';
  };
  'eventsCausingGuards': {};
  'eventsCausingDelays': {};
  'matchesStates':
    | 'init'
    | 'init.intent'
    | 'init.store'
    | 'init.services'
    | 'init.info'
    | 'ready'
    | 'ready.focus'
    | 'ready.focus.checking'
    | 'ready.focus.active'
    | 'ready.focus.inactive'
    | 'ready.network'
    | 'ready.network.checking'
    | 'ready.network.online'
    | 'ready.network.offline'
    | {
        init?: 'intent' | 'store' | 'services' | 'info';
        ready?:
          | 'focus'
          | 'network'
          | {
              focus?: 'checking' | 'active' | 'inactive';
              network?: 'checking' | 'online' | 'offline';
            };
      };
  'tags': never;
}
