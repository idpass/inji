// TODO: fix export from smartshare library
// import {
//   IdpassSmartshare,
//   GoogleNearbyMessages,
// } from '@idpass/smartshare-react-native';
import Smartshare from '@idpass/smartshare-react-native';
import { ConnectionParams } from '@idpass/smartshare-react-native/lib/typescript/IdpassSmartshare';
const { IdpassSmartshare, GoogleNearbyMessages } = Smartshare;

import { DeviceInfo } from '../components/DeviceInfoList';
import { VC } from '../types/vc';

export function onlineSubscribe<T extends SmartshareEventType>(
  eventType: T,
  callback: (data: SmartshareEventData<T>) => void,
  config?: { keepAlive: boolean }
) {
  return GoogleNearbyMessages.subscribe(
    (foundMessage) => {
      if (__DEV__) {
        console.log('\n[request] MESSAGE_FOUND', foundMessage);
      }
      const response = SmartshareEvent.fromString<T>(foundMessage);
      if (response.type === eventType) {
        !config?.keepAlive && GoogleNearbyMessages.unsubscribe();
        callback(response.data);
      }
    },
    (lostMessage) => {
      if (__DEV__) {
        console.log('\n[request] MESSAGE_LOST', lostMessage);
      }
    }
  );
}

export function onlineSend(event: SmartshareEvents) {
  return GoogleNearbyMessages.publish(
    new SmartshareEvent(event.type, event.data).toString()
  );
}

export function offlineSubscribe<T extends SmartshareEventType>(
  eventType: T,
  callback: (data: SmartshareEventData<T>) => void
) {
  return IdpassSmartshare.handleNearbyEvents(({ type, data }) => {
    if (type !== 'msg') return;

    const response = SmartshareEvent.fromString<T>(data);
    if (response.type === eventType) {
      callback(response.data);
    }
  });
}

export function offlineSend(event: SmartshareEvents, callback: () => void) {
  IdpassSmartshare.send(
    new SmartshareEvent(event.type, event.data).toString(),
    callback
  );
}

class SmartshareEvent<T extends SmartshareEventType> {
  constructor(public type: T | string, public data: SmartshareEventData<T>) {}

  static fromString<T extends SmartshareEventType>(json: string) {
    const [type, data] = json.split('\n');
    return new SmartshareEvent<T>(type, data ? JSON.parse(data) : undefined);
  }

  toString() {
    return this.data != null
      ? this.type + '\n' + JSON.stringify(this.data)
      : this.type;
  }
}

export interface PairingEvent {
  type: 'pairing';
  data: ConnectionParams;
}

export interface PairingResponseEvent {
  type: 'pairing:response';
  data: 'ok';
}

export interface ExchangeReceiverInfoEvent {
  type: 'exchange-receiver-info';
  data: DeviceInfo;
}

export interface ExchangeSenderInfoEvent {
  type: 'exchange-sender-info';
  data: DeviceInfo;
}

export interface VcChunk {
  total: number;
  chunk: number;
  rawData: string;
}
export interface SendVcEvent {
  type: 'send-vc';
  data: {
    isChunked: boolean;
    vc?: VC;
    vcChunk?: VcChunk;
  };
}

export type SendVcStatus = 'ACCEPTED' | 'REJECTED';
export interface SendVcResponseEvent {
  type: 'send-vc:response';
  data: SendVcStatus | number;
}

type SmartshareEventType = SmartshareEvents['type'];

type SmartshareEventData<T> = Extract<SmartshareEvents, { type: T }>['data'];

type SmartshareEvents =
  | PairingEvent
  | PairingResponseEvent
  | ExchangeReceiverInfoEvent
  | ExchangeSenderInfoEvent
  | SendVcEvent
  | SendVcResponseEvent;
