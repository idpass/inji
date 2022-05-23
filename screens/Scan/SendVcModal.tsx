import React from 'react';
import { Input } from 'react-native-elements';
import { DeviceInfoList } from '../../components/DeviceInfoList';
import { Button, Column, Row } from '../../components/ui';
import { Colors } from '../../components/ui/styleUtils';
import { SelectVcOverlay } from './SelectVcOverlay';
import { MessageOverlay } from '../../components/MessageOverlay';
import { Modal, ModalProps } from '../../components/ui/Modal';
import { useSendVcModal } from './SendVcModalController';
import { useTranslation } from 'react-i18next';
import { VerifyIdentityOverlay } from './VerifyIdentityOverlay';

export const SendVcModal: React.FC<SendVcModalProps> = (props) => {
  const { t } = useTranslation('SendVcModal');
  const controller = useSendVcModal();

  const reasonLabel = t('reasonForSharing');

  return (
    <Modal {...props}>
      <Column fill backgroundColor={Colors.LightGrey}>
        <Column padding="16 0" scroll>
          <DeviceInfoList of="receiver" deviceInfo={controller.receiverInfo} />
          <Column padding="24">
            <Input
              placeholder={!controller.reason ? reasonLabel : ''}
              label={controller.reason ? reasonLabel : ''}
              onChangeText={controller.UPDATE_REASON}
              containerStyle={{ marginBottom: 24 }}
            />
          </Column>
        </Column>
        <Column
          backgroundColor={Colors.White}
          padding="16 24"
          margin="2 0 0 0"
          elevation={2}>
          <Button
            title={t('acceptRequest', { vcLabel: controller.vcLabel.singular })}
            margin="12 0 12 0"
            onPress={controller.ACCEPT_REQUEST}
          />
          <Button
            type="clear"
            title={t('reject')}
            onPress={controller.CANCEL}
          />
        </Column>
      </Column>

      <SelectVcOverlay
        isVisible={controller.isSelectingVc}
        receiverName={controller.receiverInfo.deviceName}
        onSelect={controller.SELECT_VC}
        onVerifyAndSelect={controller.VERIFY_AND_SELECT_VC}
        onCancel={controller.CANCEL}
        vcKeys={controller.vcKeys}
      />

      <VerifyIdentityOverlay
        isVisible={controller.isCapturingIdentity}
        onFaceDetected={controller.FACE_DETECTED}
        onCancel={controller.CANCEL}
      />

      <MessageOverlay
        isVisible={controller.isVerifyingIdentity}
        title={t('status.verifyingIdentity')}
        hasProgress
      />

      <MessageOverlay
        isVisible={controller.isInvalidIdentity}
        title={t('errors.invalidIdentity.title')}
        message={t('errors.invalidIdentity.message')}
        onBackdropPress={props.onDismiss}>
        <Row>
          <Button title={t('common:cancel')} onPress={controller.CANCEL} />
          <Button
            title={t('common:tryAgain')}
            onPress={controller.RETRY_CAPTURE}
          />
        </Row>
      </MessageOverlay>

      <MessageOverlay
        isVisible={controller.isSendingVc}
        title={t('status.sharing.title')}
        hasProgress
      />

      <MessageOverlay
        isVisible={controller.isAccepted}
        title={t('status.accepted.title')}
        message={t('status.accepted.message', {
          vcLabel: controller.vcLabel.singular,
          receiver: controller.receiverInfo.deviceName,
        })}
        onBackdropPress={props.onDismiss}
      />

      <MessageOverlay
        isVisible={controller.isRejected}
        title={t('status.rejected.title')}
        message={t('status.rejected.message', {
          vcLabel: controller.vcLabel.singular,
          receiver: controller.receiverInfo.deviceName,
        })}
        onBackdropPress={props.onDismiss}
      />
    </Modal>
  );
};

type SendVcModalProps = ModalProps;
