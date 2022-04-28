import React from 'react';
import { EditableListItem } from '../../components/EditableListItem';
import { useDeveloperSetting } from './DeveloperSettingController';

export const DeveloperSettings: React.FC = () => {
  const controller = useDeveloperSetting();

  return (
    <>
      <EditableListItem
        label="Service URL"
        value={controller.serviceURL}
        onEdit={controller.UPDATE_SERVICE_URL}
      />
    </>
  );
};
