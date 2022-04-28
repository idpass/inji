import React, { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Divider, Icon, ListItem, Overlay } from 'react-native-elements';
import { Button, Text, Row } from '../../components/ui';
import { Colors } from '../../components/ui/styleUtils';
import { DeveloperSettings } from './DeveloperSettings';
import { useTranslation } from 'react-i18next';

export const DeveloperScreen: React.FC = () => {
  const { t } = useTranslation('DeveloperScreen');
  const [isViewing, setIsViewing] = useState(false);

  const styles = StyleSheet.create({
    buttonContainer: {
      position: 'absolute',
      left: 0,
      right: 'auto',
    },
    view: {
      flex: 1,
      width: Dimensions.get('screen').width,
    },
    settingsView: {
      padding: 20,
    },
  });

  return (
    <ListItem bottomDivider onPress={() => setIsViewing(true)}>
      <ListItem.Content>
        <ListItem.Title>
          <Text>{t('devSettings')}</Text>
        </ListItem.Title>
      </ListItem.Content>
      <Overlay
        overlayStyle={{ padding: 24 }}
        isVisible={isViewing}
        onBackdropPress={() => setIsViewing(false)}>
        <View style={styles.view}>
          <Row align="center" crossAlign="center" margin="0 0 10 0">
            <View style={styles.buttonContainer}>
              <Button
                type="clear"
                icon={<Icon name="chevron-left" color={Colors.Orange} />}
                title=""
                onPress={() => setIsViewing(false)}
              />
            </View>
            <Text size="small">{t('devSettings')}</Text>
          </Row>
          <Divider />
          <View style={styles.settingsView}>
            <DeveloperSettings />
          </View>
        </View>
      </Overlay>
    </ListItem>
  );
};
