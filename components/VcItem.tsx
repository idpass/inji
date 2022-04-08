import React, { useContext, useRef } from 'react';
import { useInterpret, useSelector } from '@xstate/react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CheckBox, Icon } from 'react-native-elements';
import { ActorRefFrom } from 'xstate';
import {
  createVcItemMachine,
  selectVerifiableCredential,
  selectGeneratedOn,
  selectTag,
  selectId,
  vcItemMachine,
} from '../machines/vcItem';
import { Column, Row, Text } from './ui';
import { Colors } from './ui/styleUtils';
import { RotatingIcon } from './RotatingIcon';
import { GlobalContext } from '../shared/GlobalContext';

const styles = StyleSheet.create({
  title: {
    color: Colors.Black,
    backgroundColor: 'transparent',
  },
  loadingTitle: {
    color: 'transparent',
    backgroundColor: Colors.Grey5,
    borderRadius: 4,
  },
  subtitle: {
    backgroundColor: 'transparent',
  },
  loadingSubtitle: {
    backgroundColor: Colors.Grey,
    borderRadius: 4,
  },
  container: {
    backgroundColor: Colors.White,
  },
  loadingContainer: {
    backgroundColor: Colors.Grey6,
    borderRadius: 4,
  },
});

export const VcItem: React.FC<VcItemProps> = (props) => {
  const { appService } = useContext(GlobalContext);
  const machine = useRef(
    createVcItemMachine(
      appService.getSnapshot().context.serviceRefs,
      props.vcKey
    )
  );
  const service = useInterpret(machine.current);
  const uin = useSelector(service, selectId);
  const tag = useSelector(service, selectTag);
  const verifiableCredential = useSelector(service, selectVerifiableCredential);
  const generatedOn = useSelector(service, selectGeneratedOn);

  const selectableOrCheck = props.selectable ? (
    <CheckBox
      checked={props.selected}
      checkedIcon={<Icon name="radio-button-checked" />}
      uncheckedIcon={<Icon name="radio-button-unchecked" />}
      onPress={() => props.onPress(service)}
    />
  ) : (
    <Icon name="chevron-right" />
  );

  return (
    <Pressable
      onPress={() => props.onPress(service)}
      disabled={!verifiableCredential}>
      <Row
        elevation={!verifiableCredential ? 0 : 2}
        crossAlign="center"
        margin={props.margin}
        backgroundColor={!verifiableCredential ? Colors.Grey6 : Colors.White}
        padding="0 16"
        style={
          !verifiableCredential ? styles.loadingContainer : styles.container
        }>
        <View style={{ marginVertical: 24, flex: 1 }}>
          <Column fill>
            <Text
              weight="semibold"
              style={!verifiableCredential ? styles.loadingTitle : styles.title}
              margin="0 0 6 0">
              {!verifiableCredential ? '' : tag || uin} 123
            </Text>
            <Text
              size="smaller"
              numLines={1}
              style={
                !verifiableCredential ? styles.loadingSubtitle : styles.subtitle
              }>
              {!verifiableCredential
                ? ''
                : verifiableCredential.credentialSubject.fullName +
                  ' · ' +
                  generatedOn}
            </Text>
          </Column>
        </View>
        { verifiableCredential ? selectableOrCheck : (<RotatingIcon name="sync" color={Colors.Grey5} />) }
      </Row>
    </Pressable>
  );
};

interface VcItemProps {
  vcKey: string;
  margin?: string;
  selectable?: boolean;
  selected?: boolean;
  onPress?: (vcRef?: ActorRefFrom<typeof vcItemMachine>) => void;
}
