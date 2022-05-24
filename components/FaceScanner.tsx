import React, { useCallback, useContext, useEffect, useRef } from 'react';
import * as FaceDetector from 'expo-face-detector';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Camera } from 'expo-camera';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from './ui/styleUtils';
import { Button, Column, Text } from './ui';
import { useInterpret, useSelector } from '@xstate/react';
import { useTranslation } from 'react-i18next';
import {
  FaceScannerEvents,
  faceScannerMachine,
  FaceScanResult,
  selectFace,
  selectIsFaceFound,
  selectIsFaceNotFound,
  selectIsImageCaptured,
  selectIsPermissionGranted,
  selectWhichCamera,
} from '../machines/faceScanner';
import { GlobalContext } from '../shared/GlobalContext';
import { selectIsActive } from '../machines/app';

const styles = StyleSheet.create({
  scannerContainer: {
    borderWidth: 4,
    borderColor: Colors.Black,
    borderRadius: 32,
    justifyContent: 'center',
    height: 400,
    width: 300,
    overflow: 'hidden',
  },
  scanner: {
    height: '100%',
    width: '100%',
    margin: 'auto',
  },
  flipIconButton: {
    alignSelf: 'center',
    alignItems: 'center',
  },
  scannerContainerInvalid: {
    borderColor: Colors.Red,
  },
  scannerContainerValid: {
    borderColor: Colors.Green,
  },
});

export const FaceScanner: React.FC<FaceScannerProps> = (props) => {
  const { t } = useTranslation('FaceScanner');
  const { appService } = useContext(GlobalContext);
  const isActive = useSelector(appService, selectIsActive);

  const machine = useRef(faceScannerMachine);
  const service = useInterpret(machine.current);

  const whichCamera = useSelector(service, selectWhichCamera);
  const face = useSelector(service, selectFace);

  const isPermissionGranted = useSelector(service, selectIsPermissionGranted);
  const isFaceNotFound = useSelector(service, selectIsFaceNotFound);
  const isFaceFound = useSelector(service, selectIsFaceFound);
  const isImageCaptured = useSelector(service, selectIsImageCaptured);

  const faceDetectorSettings = {
    mode: FaceDetector.FaceDetectorMode.accurate,
    detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
    runClassifications: FaceDetector.FaceDetectorClassifications.all,
    minDetectionInterval: 500,
    tracking: true,
  };

  const setCameraRef = useCallback(
    (node: Camera) => {
      if (node != null && isPermissionGranted) {
        service.send(FaceScannerEvents.READY(node));
      }
    },
    [isPermissionGranted]
  );

  useEffect(() => {
    if (isImageCaptured) {
      props.onFaceDetected(face);
    }
  }, [isImageCaptured]);

  useEffect(() => {
    if (isActive) {
      service.send(FaceScannerEvents.APP_FOCUSED());
    }
  }, [isActive]);

  if (!isPermissionGranted) {
    return (
      <Column padding="24" fill align="space-between">
        <Text align="center" color={Colors.Red}>
          {t('missingPermissionText')}
        </Text>
        <Button
          title={t('allowCameraButton')}
          onPress={() => service.send(FaceScannerEvents.OPEN_SETTINGS())}
        />
      </Column>
    );
  }

  return (
    <Column crossAlign="center">
      <Text size="smaller">{t('takeSelfie')}</Text>
      <Column
        style={[
          styles.scannerContainer,
          isFaceNotFound ? styles.scannerContainerInvalid : null,
          isFaceFound ? styles.scannerContainerValid : null,
        ]}>
        <Camera
          ratio="4:3"
          style={styles.scanner}
          faceDetectorSettings={faceDetectorSettings}
          type={whichCamera}
          ref={setCameraRef}
          onFacesDetected={(faces) =>
            service.send(FaceScannerEvents.FACE_DETECTED(faces))
          }
        />
      </Column>
      <Column margin="24 0">
        <TouchableOpacity
          style={styles.flipIconButton}
          onPress={() => service.send(FaceScannerEvents.FLIP_CAMERA())}>
          <Icon name="flip-camera-ios" color={Colors.Black} size={64} />
        </TouchableOpacity>
      </Column>
    </Column>
  );
};

interface FaceScannerProps {
  onFaceDetected: (face: FaceScanResult) => void;
}
