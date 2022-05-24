import vcjs from '@digitalcredentials/vc';
import jsonld from '@digitalcredentials/jsonld';
import { RsaSignature2018 } from '../../lib/jsonld-signatures/suites/rsa2018/RsaSignature2018';
import { VerifiableCredential, VerifiablePresentation } from '../../types/vc';

export function createVerifiablePresentation(
  vc: VerifiableCredential,
  challenge: string
): Promise<VerifiablePresentation> {
  console.log('vc.proof.verificationMethod', vc.proof.verificationMethod);

  const presentation = vcjs.createPresentation({
    verifiableCredential: [vc],
  });
  console.log('presentation', presentation);

  const suite = new RsaSignature2018({
    verificationMethod: vc.proof.verificationMethod,
    date: vc.proof.created,
  });
  console.log('suite', suite);

  return vcjs.signPresentation({
    presentation,
    suite,
    challenge,
    documentLoader: jsonld.documentLoaders.xhr(),
  });
}
