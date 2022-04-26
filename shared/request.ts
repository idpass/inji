import { DecodedCredential, VerifiableCredential } from '../types/vc';
import { HOST } from './constants';
import { getItem } from '../machines/store';
import * as Keychain from 'react-native-keychain';

export class BackendResponseError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
  }
}

export async function request(
  method: 'GET' | 'POST',
  path: `/${string}`,
  body?: Record<string, unknown>
) {
  let host = HOST;

  const existingCredentials = await Keychain.getGenericPassword();
  if (existingCredentials) {
    const settings = await getItem(
      'settings',
      {},
      existingCredentials.password
    );
    host = settings.serviceURL ?? host;
  }

  const response = await fetch(host + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const jsonResponse = await response.json();

  if (response.status >= 400) {
    throw new Error(jsonResponse.message || jsonResponse.error);
  }

  if (jsonResponse.errors && jsonResponse.errors.length) {
    const { errorCode, errorMessage } = jsonResponse.errors.shift();
    throw new BackendResponseError(errorCode, errorMessage);
  }

  return jsonResponse;
}

interface ResponseError {
  errorCode: string;
  errorMessage: string;
}

interface BackendResponse<T> {
  id: string;
  version: string;
  response: T;
  str?: string;
  responsetime?: string;
  metadata?: string;
  errors?: ResponseError[];
}

export type OtpRequestResponse = BackendResponse<{
  maskedMobile?: string;
  maskedEmail?: string;
}>;

export type VcGenerateResponse = BackendResponse<{
  vc: string;
  message: string;
}>;

export type CredentialRequestResponse = BackendResponse<{
  id: string;
  requestId: string;
}>;

export type CredentialStatusResponse = BackendResponse<{
  statusCode: 'NEW' | 'ISSUED' | 'printing';
}>;

export interface CredentialDownloadResponse {
  credential?: DecodedCredential;
  verifiableCredential?: VerifiableCredential;
}
