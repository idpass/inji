import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { ListItem, Overlay, Input } from 'react-native-elements';
import { Text, Column, Row, Button } from './ui';
import { Colors } from './ui/styleUtils';
import { useTranslation } from 'react-i18next';

export const EditableListItem: React.FC<EditableListItemProps> = (props) => {
  const { t } = useTranslation('common');
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState(props.value);

  const onPress = () => {
    setIsEditing(true);
    if (props.onPress) {
      props.onPress();
    }
  };
  return (
    <ListItem bottomDivider onPress={onPress}>
      <ListItem.Content>
        <ListItem.Title>
          <Text>{props.label}</Text>
        </ListItem.Title>
      </ListItem.Content>
      <Text color={Colors.Grey} style={{ maxWidth: '70%' }}>
        {props.value}
      </Text>
      <Overlay
        overlayStyle={{ padding: 24, elevation: 6 }}
        isVisible={isEditing}
        onBackdropPress={dismiss}>
        <Column width={Dimensions.get('screen').width * 0.8}>
          <Text>{t('editLabel', { label: props.label })}</Text>
          <Input autoFocus value={newValue} onChangeText={setNewValue} />
          <Row>
            <Button fill type="clear" title={t('cancel')} onPress={dismiss} />
            <Button fill title={t('save')} onPress={edit} />
          </Row>
        </Column>
      </Overlay>
    </ListItem>
  );

  function edit() {
    props.onEdit(newValue);
    setIsEditing(false);
  }

  function dismiss() {
    setNewValue(props.value);
    setIsEditing(false);
  }
};

interface EditableListItemProps {
  label: string;
  value: string;
  onEdit: (newValue: string) => void;
  onPress?: () => void;
}
