import React, { useEffect, useRef } from 'react';
import * as FaceDetector from 'expo-face-detector';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Camera } from 'expo-camera';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from './ui/styleUtils';
import { Column, Text } from './ui';
import { useInterpret, useSelector } from '@xstate/react';
import { useTranslation } from 'react-i18next';
import {
  FaceScannerEvents,
  faceScannerMachine,
  FaceScanResult,
  selectFace,
  selectIsFaceFound,
  selectIsFaceTooFar,
  selectIsImageCaptured,
  selectIsScanning,
  selectWhichCamera,
} from '../machines/faceScanner';

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
  const machine = useRef(faceScannerMachine);
  const service = useInterpret(machine.current);

  const whichCamera = useSelector(service, selectWhichCamera);
  const face = useSelector(service, selectFace);

  const isScanning = useSelector(service, selectIsScanning);
  const isFaceTooFar = useSelector(service, selectIsFaceTooFar);
  const isFaceFound = useSelector(service, selectIsFaceFound);
  const isImageCaptured = useSelector(service, selectIsImageCaptured);

  const setCameraRef = (node: Camera) =>
    !isScanning && service.send(FaceScannerEvents.READY(node));

  useEffect(() => {
    props.onFaceDetected(face);
  }, [isImageCaptured]);

  // const isActive = useSelector(appService, selectIsActive);

  // const openSettings = () => {
  //   Linking.openSettings();
  // };

  // useEffect(() => {
  //   (async () => {
  //     const response = await Camera.requestCameraPermissionsAsync();
  //     setHasPermission(response.granted);
  //   })();
  // }, []);

  // useEffect(() => {
  //   if (isActive && hasPermission === false) {
  //     (async () => {
  //       const response = await Camera.requestCameraPermissionsAsync();
  //       setHasPermission(response.granted);
  //     })();
  //   }
  // }, [isActive]);

  // useEffect(() => {
  //   if (face) {
  //     props.onFaceDetected(face);
  //   }
  // }, [face]);

  // if (hasPermission === null) {
  //   return <View />;
  // }

  // if (hasPermission === false) {
  //   return (
  //     <Column fill align="space-between">
  //       <Text align="center" color={Colors.Red}>
  //         {t('missingPermissionText')}
  //       </Text>
  //       <Button title={t('allowCameraButton')} onPress={openSettings} />
  //     </Column>
  //   );
  // }

  return (
    <Column crossAlign="center">
      <Text size="smaller">{t('takeSelfie')}</Text>
      <Column
        style={[
          styles.scannerContainer,
          isFaceTooFar ? styles.scannerContainerInvalid : null,
          isFaceFound ? styles.scannerContainerValid : null,
        ]}>
        <Camera
          ratio="4:3"
          style={styles.scanner}
          onFacesDetected={(faces) =>
            service.send(FaceScannerEvents.FACE_DETECTED(faces))
          }
          faceDetectorSettings={{
            mode: FaceDetector.FaceDetectorMode.accurate,
            detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
            runClassifications: FaceDetector.FaceDetectorClassifications.all,
            minDetectionInterval: 500,
            tracking: true,
          }}
          type={whichCamera}
          ref={setCameraRef}
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
