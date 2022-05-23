import { useSelector } from '@xstate/react';
import { Face } from 'expo-camera/build/Camera.types';
import { useContext } from 'react';
import {
  ScanEvents,
  selectIsAccepted,
  selectReason,
  selectReceiverInfo,
  selectIsRejected,
  selectIsSelectingVc,
  selectIsSendingVc,
  selectVcName,
  selectIsCapturingIdentity,
  selectIsVerifyingIdentity,
  selectIsInvalidIdentity,
} from '../../machines/scan';
import { selectVcLabel } from '../../machines/settings';
import { selectShareableVcs } from '../../machines/vc';
import { GlobalContext } from '../../shared/GlobalContext';
import { VC } from '../../types/vc';

export function useSendVcModal() {
  const { appService } = useContext(GlobalContext);
  const scanService = appService.children.get('scan');
  const settingsService = appService.children.get('settings');
  const vcService = appService.children.get('vc');

  return {
    receiverInfo: useSelector(scanService, selectReceiverInfo),
    reason: useSelector(scanService, selectReason),
    vcName: useSelector(scanService, selectVcName),
    vcLabel: useSelector(settingsService, selectVcLabel),
    vcKeys: useSelector(vcService, selectShareableVcs),

    isSelectingVc: useSelector(scanService, selectIsSelectingVc),
    isSendingVc: useSelector(scanService, selectIsSendingVc),
    isAccepted: useSelector(scanService, selectIsAccepted),
    isRejected: useSelector(scanService, selectIsRejected),
    isCapturingIdentity: useSelector(scanService, selectIsCapturingIdentity),
    isVerifyingIdentity: useSelector(scanService, selectIsVerifyingIdentity),
    isInvalidIdentity: useSelector(scanService, selectIsInvalidIdentity),

    ACCEPT_REQUEST: () => scanService.send(ScanEvents.ACCEPT_REQUEST()),
    CANCEL: () => scanService.send(ScanEvents.CANCEL()),
    SELECT_VC: (vc: VC) => scanService.send(ScanEvents.SELECT_VC(vc)),
    VERIFY_AND_SELECT_VC: (vc: VC) =>
      scanService.send(ScanEvents.VERIFY_AND_SELECT_VC(vc)),
    FACE_DETECTED: (face: Face) =>
      scanService.send(ScanEvents.FACE_DETECTED(face)),
    RETRY_CAPTURE: () => scanService.send(ScanEvents.RETRY_CAPTURE()),
    DISMISS: () => scanService.send(ScanEvents.DISMISS()),
    UPDATE_REASON: (reason: string) =>
      scanService.send(ScanEvents.UPDATE_REASON(reason)),
    UPDATE_VC_NAME: (vcName: string) =>
      scanService.send(ScanEvents.UPDATE_VC_NAME(vcName)),
  };
}
