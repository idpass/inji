import { TextInput } from 'react-native';
import {
  assign,
  DoneInvokeEvent,
  ErrorPlatformEvent,
  EventFrom,
  sendParent,
  StateFrom,
} from 'xstate';
import { createModel } from 'xstate/lib/model';
import { BackendResponseError, request } from '../../../shared/request';
import { VC_ITEM_STORE_KEY } from '../../../shared/constants';
import { VcIdType } from '../../../types/vc';

const model = createModel(
  {
    idInputRef: null as TextInput,
    id: '',
    idType: 'UIN' as VcIdType,
    idError: '',
    otp: '',
    otpError: '',
    transactionId: '',
    requestId: '',
  },
  {
    events: {
      INPUT_ID: (id: string) => ({ id }),
      INPUT_OTP: (otp: string) => ({ otp }),
      VALIDATE_INPUT: () => ({}),
      READY: (idInputRef: TextInput) => ({ idInputRef }),
      DISMISS: () => ({}),
      SELECT_ID_TYPE: (idType: VcIdType) => ({ idType }),
    },
  }
);

export const AddVcModalEvents = model.events;

export const AddVcModalMachine = model.createMachine(
  {
    tsTypes: {} as import('./AddVcModalMachine.typegen').Typegen0,
    schema: {
      context: model.initialContext,
      events: {} as EventFrom<typeof model>,
    },
    id: 'AddVcModal',
    initial: 'acceptingIdInput',
    states: {
      acceptingIdInput: {
        id: 'acceptingIdInput',
        entry: ['setTransactionId', 'clearOtp'],
        initial: 'rendering',
        states: {
          rendering: {
            on: {
              READY: {
                target: 'focusing',
                actions: ['setIdInputRef'],
              },
            },
          },
          focusing: {
            // delay on first render to show keyboard
            after: {
              100: 'idle',
            },
          },
          idle: {
            entry: ['focusInput'],
            on: {
              INPUT_ID: {
                actions: ['setId'],
              },
              VALIDATE_INPUT: [
                { cond: 'isEmptyId', target: 'invalid.empty' },
                {
                  cond: 'isWrongIdFormat',
                  target: 'invalid.format',
                },
                { target: 'requestingOtp' },
              ],
              SELECT_ID_TYPE: {
                actions: ['setIdType', 'clearId'],
              },
            },
          },
          invalid: {
            entry: ['focusInput'],
            on: {
              INPUT_ID: {
                target: 'idle',
                actions: ['setId', 'clearIdError'],
              },
              VALIDATE_INPUT: [
                { cond: 'isEmptyId', target: '.empty' },
                {
                  cond: 'isWrongIdFormat',
                  target: '.format',
                },
                { target: 'requestingOtp' },
              ],
            },
            states: {
              empty: {
                entry: ['setIdErrorEmpty'],
              },
              format: {
                entry: ['setIdErrorWrongFormat'],
              },
              backend: {},
            },
          },
          requestingOtp: {
            invoke: {
              src: 'requestOtp',
              onDone: '#acceptingOtpInput',
              onError: {
                target: 'invalid.backend',
                actions: ['setIdError'],
              },
            },
          },
        },
        on: {
          DISMISS: {
            actions: [sendParent('DISMISS')],
          },
        },
      },
      acceptingOtpInput: {
        id: 'acceptingOtpInput',
        entry: ['clearOtp'],
        on: {
          INPUT_OTP: {
            target: 'requestingCredential',
            actions: ['setOtp'],
          },
          DISMISS: '#acceptingIdInput.rendering',
        },
      },
      requestingCredential: {
        invoke: {
          src: 'requestCredential',
          onDone: {
            target: 'done',
            actions: ['setRequestId'],
          },
          onError: [
            {
              cond: 'isIdInvalid',
              target: '#acceptingIdInput.invalid',
              actions: ['setIdError'],
            },
            {
              target: 'acceptingOtpInput',
              actions: ['setOtpError'],
            },
          ],
        },
      },
      done: {
        type: 'final',
        data: (context) => VC_ITEM_STORE_KEY(context),
      },
    },
  },
  {
    actions: {
      setId: model.assign({
        id: (_context, event) => event.id,
      }),

      setIdType: model.assign({
        idType: (_context, event) => event.idType,
      }),

      setOtp: model.assign({
        otp: (_context, event) => event.otp,
      }),

      setTransactionId: assign({
        transactionId: () => String(new Date().valueOf()).substring(3, 13),
      }),

      setRequestId: assign({
        requestId: (_context, event) => (event as DoneInvokeEvent<string>).data,
      }),

      setIdError: assign({
        idError: (_context, event) =>
          (event as ErrorPlatformEvent).data.message,
      }),

      clearId: model.assign({ id: '' }),

      clearIdError: model.assign({ idError: '' }),

      setIdErrorEmpty: model.assign({
        idError: 'The input cannot be empty',
      }),

      setIdErrorWrongFormat: model.assign({
        idError: 'The input format is incorrect',
      }),

      setOtpError: assign({
        otpError: (_context, event) =>
          (event as ErrorPlatformEvent).data.message,
      }),

      setIdInputRef: model.assign({
        idInputRef: (_context, event) => event.idInputRef,
      }),

      clearOtp: assign({ otp: '' }),

      focusInput: (context) => context.idInputRef.focus(),
    },

    services: {
      requestOtp: async (context) => {
        return request('POST', '/req/otp', {
          individualId: context.id,
          individualIdType: context.idType,
          otpChannel: ['EMAIL', 'PHONE'],
          transactionID: context.transactionId,
        });
      },

      requestCredential: async (context) => {
        const response = await request('POST', '/credentialshare/request', {
          individualId: context.id,
          individualIdType: context.idType,
          otp: context.otp,
          transactionID: context.transactionId,
        });
        return response.response.requestId;
      },
    },

    guards: {
      isEmptyId: ({ id }) => !id || !id.length,

      isWrongIdFormat: ({ id }) => !/^\d{10,16}$/.test(id),

      isIdInvalid: (_context, event: unknown) =>
        ['IDA-MLC-009', 'RES-SER-29', 'IDA-MLC-018'].includes(
          (event as BackendResponseError).name
        ),
    },
  }
);

type State = StateFrom<typeof AddVcModalMachine>;

export function selectId(state: State) {
  return state.context.id;
}

export function selectIdType(state: State) {
  return state.context.idType;
}

export function selectIdInputRef(state: State) {
  return state.context.idInputRef;
}

export function selectIdError(state: State) {
  return state.context.idError;
}

export function selectOtpError(state: State) {
  return state.context.otpError;
}

export function selectIsAcceptingIdInput(state: State) {
  return state.matches('acceptingIdInput');
}

export function selectIsInvalid(state: State) {
  return state.matches('acceptingIdInput.invalid');
}

export function selectIsAcceptingOtpInput(state: State) {
  return state.matches('acceptingOtpInput');
}

export function selectIsRequestingOtp(state: State) {
  return state.matches('acceptingIdInput.requestingOtp');
}

export function selectIsRequestingCredential(state: State) {
  return state.matches('requestingCredential');
}
