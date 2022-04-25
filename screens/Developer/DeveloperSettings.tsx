import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export const SettingsComponent: React.FC<SettingsComponentProps> = (props) => {
  const navigation = useNavigation();

  const function1 = () => {
    navigation.navigate('SignIn');
  };
  const function2 = () => {
    alert('Logged Out');
  };

  return (
    <ScrollView style={{ backgroundColor: 'white' }}>
      {props.settingsOptions.map(({ title, subTitle }) => (
        <TouchableOpacity key={title}>
          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: 20,
              paddingTop: 20,
            }}>
            <Text style={{ fontSize: 17 }}>{title}</Text>
            {subTitle && (
              <Text
                style={{
                  fontSize: 14,
                  opacity: 0.6,
                  color: 'grey',
                  paddingTop: 5,
                }}>
                {subTitle}
              </Text>
            )}
          </View>
          <View style={{ height: 0.5, backgroundColor: 'grey' }} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={() => {
          function1();
          function2();
        }}
        style={{
          padding: 20,
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'red',
        }}>
        <Text>{'Logout'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

interface SettingsOption {
  title: string;
  subTitle: string;
  onPress?: () => void;
}

interface SettingsComponentProps {
  settingsOptions: SettingsOption[];
}
