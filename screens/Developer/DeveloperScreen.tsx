import React from 'react';
import SettingsComponent from './DeveloperSettings';

const Settings = () => {
  const settingsOptions = [
    { title: 'My Info', subTitle: 'SETUP YOUR PROFILE', onPress: () => null },
    { title: 'Accounts', subTitle: null, onPress: () => null },
    { title: 'Contacts', subTitle: 'Your friends', onPress: () => null },
    { title: 'Downloads', subTitle: 'Downloaded movies', onPress: () => null },
    { title: 'Import', subTitle: null, onPress: () => null },
    { title: 'Blocked Contacts', subTitle: null, onPress: () => null },
    { title: 'Developer Tools', subTitle: null, onPress: () => null },
  ];

  return <SettingsComponent settingsOptions={settingsOptions} />;
};

export default Settings;
