import { useContext } from 'react';
import { ScanEvents, scanMachine, selectSelectedVc } from '../../machines/scan';
import { GlobalContext } from '../../shared/GlobalContext';

import { Face } from 'expo-camera/build/Camera.types';
import { FaceScanResult } from '../../machines/faceScanner';
import { useSelector } from '@xstate/react';

export function useVerifyIdentityOverlay() {
  const { appService } = useContext(GlobalContext);
  const scanService = appService.children.get(scanMachine.id);

  return {
    selectedVc: useSelector(scanService, selectSelectedVc),

    FACE_DETECTED: (face?: FaceScanResult) =>
      scanService.send(ScanEvents.FACE_DETECTED(face)),
  };
}

export interface VerifyIdentityOverlayProps {
  isVisible: boolean;
  onFaceDetected: (face: Face) => void;
  onCancel: () => void;
}
