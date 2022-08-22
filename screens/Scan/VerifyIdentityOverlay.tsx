import FaceAuth from 'mosip-mobileid-sdk';
import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Icon, Overlay } from 'react-native-elements';
// import { FaceScanner } from '../../components/FaceScanner';
import { Column, Row } from '../../components/ui';
import { Colors } from '../../components/ui/styleUtils';
import {
  useVerifyIdentityOverlay,
  VerifyIdentityOverlayProps,
} from './VerifyIdentityOverlayController';

const styles = StyleSheet.create({
  content: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
    backgroundColor: Colors.White,
  },
});

export const VerifyIdentityOverlay: React.FC<VerifyIdentityOverlayProps> = (
  props
) => {
  const controller = useVerifyIdentityOverlay();

  return (
    <Overlay isVisible={props.isVisible}>
      <Row align="flex-end" padding="16">
        <Icon name="close" color={Colors.Orange} onPress={props.onCancel} />
      </Row>
      <Column fill style={styles.content} align="center">
        <FaceAuth
          data={controller.selectedVc?.credential?.biometrics.face}
          onValidationSuccess={controller.FACE_DETECTED}
        />
        {/* <FaceScanner onFaceDetected={controller.FACE_DETECTED} /> */}
      </Column>
    </Overlay>
  );
};
