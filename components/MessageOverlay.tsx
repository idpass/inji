import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Overlay, LinearProgress } from 'react-native-elements';
import { Button, Column, Text } from './ui';
import { Colors, elevation } from './ui/styleUtils';

const styles = StyleSheet.create({
  overlay: {
    ...elevation(5),
    backgroundColor: Colors.White,
  },
});

export const MessageOverlay: React.FC<AsyncOverlayProps> = (props) => {
  const [showAbortBtn, setShowAbortBtn] = useState(
    props.cancelDelay ? false : true
  );
  const progressVariant = props.isDeterminate ? 'determinate' : 'indeterminate';
  const delay = props.cancelDelay ? props.cancelDelay : 0;

  useEffect(() => {
    if (delay) {
      setTimeout(() => {
        setShowAbortBtn(true);
      }, delay);
    }
  }, [props.isVisible]);

  useEffect(() => {
    if (props.progress === 1) {
      setShowAbortBtn(false);
    }
  }, [props.progress]);

  return (
    <Overlay
      isVisible={props.isVisible}
      overlayStyle={styles.overlay}
      onBackdropPress={props.onBackdropPress}>
      <Column padding="24" width={Dimensions.get('screen').width * 0.8}>
        {props.title && (
          <Text weight="semibold" margin="0 0 12 0">
            {props.title}
          </Text>
        )}
        {props.message && <Text margin="0 0 12 0">{props.message}</Text>}
        {props.hasProgress && (
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1 }}>
              <LinearProgress
                variant={progressVariant}
                color={Colors.Orange}
                value={props.progress}
              />
            </View>
            {props.isDeterminate && (
              <Text weight="semibold" margin="-12 0 0 8">
                % {props.progress * 100}
              </Text>
            )}
          </View>
        )}
      </Column>
      {props.hasProgress && showAbortBtn && (
        <View>
          <Button
            margin="0 -10 -10 -10"
            title={props.cancelLabel}
            onPress={props.onCancel}
          />
        </View>
      )}
    </Overlay>
  );
};

interface MessageOverlayProps {
  isVisible: boolean;
  title?: string;
  message?: string;
  onBackdropPress?: () => void;
}

interface AsyncOverlayProps extends MessageOverlayProps {
  isCancellable?: boolean; // should handle "Back" button behavior
  isDeterminate?: boolean; // default: false
  cancelLabel?: string; // default: 'Cancel'
  cancelDelay?: number; // time before we show the cancel button
  progress?: number;
  hasProgress?: boolean;
  onCancel?: () => void;
}
