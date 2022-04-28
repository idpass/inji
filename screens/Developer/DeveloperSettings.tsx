import React from 'react';
import { EditableListItem } from '../../components/EditableListItem';
import { useDeveloperSetting } from './DeveloperSettingController';
import { useTranslation } from 'react-i18next';

export const DeveloperSettings: React.FC = () => {
  const controller = useDeveloperSetting();
  const { t } = useTranslation('DeveloperScreen');

  return (
    <>
      <EditableListItem
        label={t('serviceURL')}
        value={controller.serviceURL}
        onEdit={controller.UPDATE_SERVICE_URL}
      />
    </>
  );
};
