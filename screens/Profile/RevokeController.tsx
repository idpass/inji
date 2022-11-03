import { useSelector } from '@xstate/react';
import { useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { GlobalContext } from '../../shared/GlobalContext';
import { VcEvents } from '../../machines/vc';
import { vcItemMachine } from '../../machines/vcItem';
import { useTranslation } from 'react-i18next';

import {
  RevokeVidsEvents,
  selectIsAcceptingOtpInput,
  selectIsRevokingVc,
  selectIsLoggingRevoke,
  selectVIDs,
  selectIsFetchingVIDs,
} from '../../machines/revoke';

import { ActorRefFrom } from 'xstate';

export function useRevoke() {
  const { t } = useTranslation('ProfileScreen');
  const { appService } = useContext(GlobalContext);
  const vcService = appService.children.get('vc');
  const revokeService = appService.children.get('RevokeVids');
  const isRevokingVc = useSelector(revokeService, selectIsRevokingVc);
  const isLoggingRevoke = useSelector(revokeService, selectIsLoggingRevoke);
  const isAcceptingOtpInput = useSelector(
    revokeService,
    selectIsAcceptingOtpInput
  );
  const vidKeys = useSelector(revokeService, selectVIDs);
  const isFetchingVIDs = useSelector(revokeService, selectIsFetchingVIDs);

  const [isRevoking, setRevoking] = useState(false);
  const [isAuthenticating, setAuthenticating] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number>(null);
  const [selectedVidKeys, setSelectedVidKeys] = useState<string[]>([]);

  const selectVcItem = (index: number, vcKey: string) => {
    return () => {
      setSelectedIndex(index);
      if (selectedVidKeys.includes(vcKey)) {
        setSelectedVidKeys(selectedVidKeys.filter((item) => item !== vcKey));
      } else {
        setSelectedVidKeys((prevArray) => [...prevArray, vcKey]);
      }
    };
  };

  const showToast = (message: string) => {
    setToastVisible(true);
    setMessage(message);
    setTimeout(() => {
      setToastVisible(false);
      setMessage('');
    }, 3000);
  };

  useEffect(() => {
    if (isRevokingVc) {
      setSelectedVidKeys([]);
      showToast(t('revokeSuccessful'));
    }
    if (isLoggingRevoke) {
      revokeService.send(RevokeVidsEvents.DISMISS());
      //to refresh VCs under Home screen
      vcService.send(VcEvents.REFRESH_MY_VCS());
    }
  }, [isRevokingVc, isLoggingRevoke]);

  return {
    error: '',
    isAcceptingOtpInput,
    isAuthenticating,
    isFetchingVIDs,
    isRevoking,
    isViewing,
    message,
    selectedIndex,
    selectedVidKeys,
    toastVisible,
    vidKeys,

    CONFIRM_REVOKE_VC: () => {
      setRevoking(true);
    },
    DISMISS: () => {
      revokeService.send(RevokeVidsEvents.DISMISS());
    },
    INPUT_OTP: (otp: string) =>
      revokeService.send(RevokeVidsEvents.INPUT_OTP(otp)),
    REFRESH: () => {
      revokeService.send(RevokeVidsEvents.FETCH_VIDs());
    },
    REVOKE_VC: () => {
      revokeService.send(RevokeVidsEvents.REVOKE_VCS(selectedVidKeys));
      setRevoking(false);
      //since nested modals/overlays don't work in ios, we need to toggle revoke screen
      setIsViewing(false);
    },
    revokeVc: (otp: string) => {
      NetInfo.fetch().then((state) => {
        if (state.isConnected) {
          revokeService.send(RevokeVidsEvents.INPUT_OTP(otp));
        } else {
          revokeService.send(RevokeVidsEvents.DISMISS());
          showToast('Request network failed');
        }
      });
    },
    setAuthenticating,
    selectVcItem,
    setIsViewing,
    setRevoking,
  };
}

export interface RevokeProps {
  service: ActorRefFrom<typeof vcItemMachine>;
}
