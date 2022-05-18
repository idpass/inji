export interface VC {
  id: string;
  idType: VcIdType;
  tag: string;
  credential: DecodedCredential;
  verifiableCredential: VerifiableCredential;
  generatedOn: Date;
  requestId: string;
  isVerified: boolean;
  lastVerifiedOn: number;
  locked: boolean;
  reason?: VCSharingReason[];
}

export interface VCSharingReason {
  timestamp: number;
  message: string;
}

export type VcIdType = 'UIN' | 'VID';

export interface DecodedCredential {
  biometrics: {
    face: string;
    finger: {
      left_thumb: string;
      right_thumb: string;
    };
  };
}

export interface CredentialSubject {
  UIN: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  biometrics: string; // Encrypted Base64Encoded Biometrics
  city: string;
  dateOfBirth: string;
  email: string;
  fullName: string;
  gender: string;
  id: string;
  phone: string;
  postalCode: string;
  province: string;
  region: string;
  vcVer: 'VC-V1' | string;
}

type VCContext = (string | Record<string, unknown>)[];

export interface VerifiableCredential {
  '@context': VCContext;
  'credentialSubject': CredentialSubject;
  'id': string;
  'issuanceDate': string;
  'issuer': string;
  'proof': {
    created: string;
    jws: string;
    proofPurpose: 'assertionMethod' | string;
    type: 'RsaSignature2018' | string;
    verificationMethod: string;
  };
  'type': VerifiableCredentialType[];
}

export interface VerifiablePresentation {
  '@context': VCContext;
  'verifiableCredential': VerifiableCredential[];
  'type': 'VerifiablePresentation';
  'proof': {
    created: string;
    jws: string;
    proofPurpose: 'authentication' | string;
    type: 'RsaSignature2018' | string;
    verificationMethod: string;
    challenge: string;
    domain: string;
  };
}

export type VerifiableCredentialType =
  | 'VerifiableCredential'
  | 'MOSIPVerfiableCredential'
  | string;

export interface VCLabel {
  singular: string;
  plural: string;
}
