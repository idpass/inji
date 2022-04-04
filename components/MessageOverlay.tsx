import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Dimensions, StyleSheet } from 'react-native';
import { Overlay, LinearProgress } from 'react-native-elements';
import { Button, Column, Text } from './ui';
import { Colors, elevation } from './ui/styleUtils';

const styles = StyleSheet.create({
  overlay: {
    ...elevation(5),
    backgroundColor: Colors.White,
  }
});

export const MessageOverlay: React.FC<AsyncOverlayProps> = (props) => {
  const [showAbortBtn, setAbortBtn] = useState(false)
  const [delay, setDelay] = useState(props.cancelDelay ? props.cancelDelay : 0)

  useEffect(() => {
    console.log('delay', delay)
    setTimeout(() => {
      setAbortBtn(true)
    }, delay)
  }, [props.isVisible])

  return (
    <Overlay
      isVisible={props.isVisible}
      overlayStyle={styles.overlay}
      onBackdropPress={props.onBackdropPress}
    >
      <Column padding="24" width={Dimensions.get('screen').width * 0.8}>
        {props.title && (
          <Text weight="semibold" margin="0 0 12 0">
            {props.title}
          </Text>
        )}
        {props.message && <Text margin="0 0 12 0">{props.message}</Text>}
        {props.hasProgress && (
          <LinearProgress variant="indeterminate" color={Colors.Orange} />
        )}
      </Column>
      {props.hasProgress && showAbortBtn && (
        <Button
          margin="0 -10 -10 -10"
          title={props.cancelLabel}
          onPress={props.onCancel}
        />
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