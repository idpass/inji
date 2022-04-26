import React, { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Divider, Icon, ListItem, Overlay } from 'react-native-elements';
import { SettingsComponent } from './DeveloperSettings';
import { Button, Text, Row } from '../../components/ui';
import { Colors } from '../../components/ui/styleUtils';

export const DeveloperSettings: React.FC<DeveloperProps> = (props) => {
  const [isViewing, setIsViewing] = useState(false);

  const settingsOptions = [
    { title: 'My Info', subTitle: 'SETUP YOUR PROFILE', onPress: () => null },
    { title: 'Accounts', subTitle: null, onPress: () => null },
    { title: 'Contacts', subTitle: 'Your friends', onPress: () => null },
    { title: 'Downloads', subTitle: 'Downloaded movies', onPress: () => null },
    { title: 'Import', subTitle: null, onPress: () => null },
    { title: 'Blocked Contacts', subTitle: null, onPress: () => null },
    { title: 'Developer Tools', subTitle: null, onPress: () => null },
  ];

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
          <Text>{props.label}</Text>
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
                title="Back"
                onPress={() => setIsViewing(false)}
              />
            </View>
            <Text size="small">Developer Settings</Text>
          </Row>
          <Divider />
          <View style={styles.settingsView}>
            <Text>Developer Settings</Text>
            <SettingsComponent settingsOptions={settingsOptions} />
          </View>
        </View>
      </Overlay>
    </ListItem>
  );
};

interface DeveloperProps {
  label: string;
}
