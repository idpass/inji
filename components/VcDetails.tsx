import React from 'react';
import { Image } from 'react-native';
import { Icon, ListItem } from 'react-native-elements';
import { VC, CredentialSubject } from '../types/vc';
import { Column, Row, Text } from './ui';
import { Colors } from './ui/styleUtils';

const VerifiedIcon: React.FC = () => {
  return (
    <Icon
      name="check-circle"
      color={Colors.Green}
      size={14}
      containerStyle={{ marginStart: 4, bottom: 1 }}
    />
  );
};

export const VcDetails: React.FC<VcDetailsProps> = (props) => {
  return (
    <Column>
      <Row pY={16} pX={8} align="space-between">
        <Column fill elevation={1} pY={12} pX={16} margin="0 8">
          <Text size="smaller" color={Colors.Grey}>
            Generated
          </Text>
          <Text weight="bold" size="smaller">
            {new Date(props.vc?.generatedOn).toLocaleDateString()}
          </Text>
        </Column>
        <Column fill elevation={1} pY={12} pX={16} margin="0 16 0 0">
          <Text
            size="smaller"
            color={Colors.Grey}
            style={{ textTransform: 'uppercase' }}>
            {props.vc?.idType}
          </Text>
          <Text weight="bold" size="smaller">
            {props.vc?.id}
          </Text>
        </Column>
        <Column fill elevation={1} pY={12} pX={16} margin="0 8">
          <Text size="smaller" color={Colors.Grey}>
            Status
          </Text>
          <Row>
            <Text weight="bold" size="smaller">
              Valid
            </Text>
            {props.vc?.isVerified && <VerifiedIcon />}
          </Row>
        </Column>
      </Row>
      <ListItem bottomDivider>
        <ListItem.Content>
          <ListItem.Subtitle>Photo</ListItem.Subtitle>
          <ListItem.Content>
            <Image
              source={
                props.vc?.credential.biometrics?.face
                  ? { uri: props.vc?.credential.biometrics.face }
                  : require('../assets/placeholder-photo.png')
              }
              style={{
                width: 110,
                height: 110,
                resizeMode: 'cover',
                marginTop: 8,
              }}
            />
          </ListItem.Content>
        </ListItem.Content>
      </ListItem>
      <ListItem bottomDivider>
        <ListItem.Content>
          <ListItem.Subtitle>Full name</ListItem.Subtitle>
          <ListItem.Title>
            {props.vc?.verifiableCredential.credentialSubject.fullName}
          </ListItem.Title>
        </ListItem.Content>
      </ListItem>
      <ListItem bottomDivider>
        <ListItem.Content>
          <ListItem.Subtitle>Gender</ListItem.Subtitle>
          <ListItem.Title>
            {getLocalizedField(
              props.vc?.verifiableCredential.credentialSubject.gender
            )}
          </ListItem.Title>
        </ListItem.Content>
      </ListItem>
      <ListItem bottomDivider>
        <ListItem.Content>
          <ListItem.Subtitle>Date of birth</ListItem.Subtitle>
          <ListItem.Title>
            {props.vc?.verifiableCredential.credentialSubject.dateOfBirth}
          </ListItem.Title>
        </ListItem.Content>
      </ListItem>
      <ListItem bottomDivider>
        <ListItem.Content>
          <ListItem.Subtitle>Phone number</ListItem.Subtitle>
          <ListItem.Title>
            {props.vc?.verifiableCredential.credentialSubject.phone}
          </ListItem.Title>
        </ListItem.Content>
      </ListItem>
      <ListItem bottomDivider>
        <ListItem.Content>
          <ListItem.Subtitle>Email</ListItem.Subtitle>
          <ListItem.Title>
            {props.vc?.verifiableCredential.credentialSubject.email}
          </ListItem.Title>
        </ListItem.Content>
      </ListItem>
      <ListItem bottomDivider>
        <ListItem.Content>
          <ListItem.Subtitle>Address</ListItem.Subtitle>
          <ListItem.Title>
            {getFullAddress(props.vc?.verifiableCredential.credentialSubject)}
          </ListItem.Title>
        </ListItem.Content>
      </ListItem>
      {Boolean(props.vc?.reason) && (
        <ListItem bottomDivider>
          <ListItem.Content>
            <ListItem.Subtitle>Reason for sharing</ListItem.Subtitle>
            <ListItem.Title>{props.vc?.reason}</ListItem.Title>
          </ListItem.Content>
        </ListItem>
      )}
    </Column>
  );
};

interface VcDetailsProps {
  vc: VC;
}

interface LocalizedField {
  language: string;
  value: string;
}

function getFullAddress(credential: CredentialSubject) {
  if (!credential) {
    return '';
  }

  const fields = [
    'addressLine1',
    'addressLine2',
    'addressLine3',
    'city',
    'province',
    'region',
  ];
  return fields
    .map((field) => getLocalizedField(credential[field]))
    .concat(credential.postalCode)
    .filter(Boolean)
    .join(', ');
}

function getLocalizedField(rawField: string | LocalizedField) {
  try {
    const locales: LocalizedField[] =
      typeof rawField === 'string' ? JSON.parse(rawField) : rawField;
    return locales.find((locale) => locale.language === 'eng').value.trim();
  } catch (e) {
    return '';
  }
}
