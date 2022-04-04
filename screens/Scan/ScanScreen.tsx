import React from 'react';
import { QrScanner } from '../../components/QrScanner';
import { Button, Column, Text } from '../../components/ui';
import { Colors } from '../../components/ui/styleUtils';
import { MainRouteProps } from '../../routes/main';
import { MessageOverlay } from '../../components/MessageOverlay';
import { SendVcModal } from './SendVcModal';
import { useScanScreen } from './ScanScreenController';

export const ScanScreen: React.FC<MainRouteProps> = (props) => {
  const controller = useScanScreen(props);

  return (
    <Column fill padding="98 24 24 24" backgroundColor={Colors.LightGrey}>
      <Text align="center">Scan QR Code</Text>

      {controller.isLocationDisabled ||
      controller.isLocationDenied ||
      controller.isFlightMode ? (
        <Column fill align="space-between">
          <Text align="center" margin="16 0" color={Colors.Red}>
            {controller.locationError.message}
          </Text>
          <Button
            title={controller.locationError.button}
            onPress={controller.ON_REQUEST}
          />
        </Column>
      ) : null}

      {!controller.isEmpty ? (
        controller.isScanning && (
          <Column fill padding="16 0" crossAlign="center">
            <QrScanner onQrFound={controller.SCAN} />
          </Column>
        )
      ) : (
        <Text align="center" margin="16 0" color={Colors.Red}>
          No sharable {controller.vcLabel.plural} are available.
        </Text>
      )}

      <MessageOverlay
        isVisible={controller.statusMessage !== ''}
        message={controller.statusMessage}
        hasProgress={!controller.isInvalid}
        onBackdropPress={controller.DISMISS_INVALID}
        onCancel={controller.DISMISS}
        cancelLabel="Cancel"
      />

      <SendVcModal
        isVisible={controller.isReviewing}
        onDismiss={controller.DISMISS}
        headerElevation={2}
        headerTitle={`Sharing ${controller.vcLabel.singular}`}
      />
    </Column>
  );
};
