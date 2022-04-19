import React from 'react';
import { Icon, Input } from 'react-native-elements';
import { Picker } from '@react-native-picker/picker';
import { Button, Centered, Column, Row, Text } from '../../../components/ui';
import { Modal } from '../../../components/ui/Modal';
import { Colors } from '../../../components/ui/styleUtils';
import { IdInputModalProps, useIdInputModal } from './IdInputModalController';
import { Platform } from 'react-native';

export const IdInputModal: React.FC<IdInputModalProps> = (props) => {
  const controller = useIdInputModal(props);
  const inputLabel = `Enter your ${controller.idType}`;

  return (
    <Modal onDismiss={props.onDismiss} isVisible={props.isVisible}>
      <Column fill padding="32 24">
        <Text align="center" style={{ flex: Platform.OS === 'ios' ? 0.4 : 0.9 }}>
          Enter the MOSIP-provided UIN or VID{'\n'}of the{' '}
          {controller.vcLabel.singular} you wish to retrieve
        </Text>
        <Column>
          <Row crossAlign="flex-end">
            <Column
              width="33%"
              style={{
                borderBottomWidth: 1,
                borderColor: Platform.OS === 'ios' ? 'transparent' : Colors.Grey,
                bottom: Platform.OS === 'ios' ? 50 : 24,
                height: Platform.OS === 'ios' ? 100 : 'auto'
              }}>
              <Picker
                selectedValue={controller.idType}
                onValueChange={controller.SELECT_ID_TYPE}>
                <Picker.Item label="UIN" value="UIN" />
                <Picker.Item label="VID" value="VID" />
              </Picker>
            </Column>
            <Column fill>
              <Input
                placeholder={!controller.id ? inputLabel : ''}
                label={controller.id ? inputLabel : ''}
                labelStyle={{
                  color: controller.isInvalid ? Colors.Red : Colors.Black,
                }}
                value={controller.id}
                keyboardType="number-pad"
                rightIcon={
                  controller.isInvalid ? (
                    <Icon name="error" size={18} color="red" />
                  ) : null
                }
                errorStyle={{ color: Colors.Red }}
                errorMessage={controller.idError}
                onChangeText={controller.INPUT_ID}
                ref={(node) => !controller.idInputRef && controller.READY(node)}
              />
            </Column>
          </Row>
          <Button
            title={`Generate ${controller.vcLabel.singular}`}
            margin="24 0 0 0"
            onPress={controller.VALIDATE_INPUT}
            loading={controller.isRequestingOtp}
          />
        </Column>
      </Column>
    </Modal>
  );
};
