import { useContext } from 'react';
import { ScanEvents, scanMachine } from '../../machines/scan';
import { GlobalContext } from '../../shared/GlobalContext';

import { Face } from 'expo-camera/build/Camera.types';
import { FaceScanResult } from '../../machines/faceScanner';

export function useVerifyIdentityOverlay() {
  const { appService } = useContext(GlobalContext);
  const scanService = appService.children.get(scanMachine.id);

  return {
    FACE_DETECTED: (face: FaceScanResult) =>
      scanService.send(ScanEvents.FACE_DETECTED(face)),
  };
}

export interface VerifyIdentityOverlayProps {
  isVisible: boolean;
  onFaceDetected: (face: Face) => void;
  onCancel: () => void;
}
