import { useEffect, useState, useCallback } from 'react';
import { useWeb3React } from '@web3-react/core';
import { injected } from '../connectors';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import {
  selectAuth,
  setAddress,
  setChainId,
  setITO,
} from '../slices/authSlice';
import { useAuth } from './firebase';
import getITO from '../utils/getITO';

export const useEagerConnect = () => {
  const { activate, active } = useWeb3React();
  const [tried, setTried] = useState(false);

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true);
        });
        return;
      }
      setTried(true);
    });
  }, []);

  // wait until we get confirmation of a connection to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true);
    }
  }, [tried, active]);

  return tried;
};

export const useInactiveListener = (suppress = false) => {
  const { active, error, activate } = useWeb3React();

  useEffect(() => {
    const { ethereum } = window as any;

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        activate(injected, undefined, true).catch((error) => {
          console.error('Failed to activate after chain changed', error);
        });
      };

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          activate(injected, undefined, true).catch((error) => {
            console.error('Failed to activate after accounts changed', error);
          });
        }
      };

      ethereum.on('chainChanged', handleChainChanged);
      ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged);
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
    return undefined;
  }, [active, error, suppress]);
};

export const useAccount = () => {
  const auth = useAppSelector(selectAuth);
  const { account, chainId, library } = useWeb3React();
  const { signOut } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const updateITO = async () => {
      dispatch(setITO(await getITO(account as string, library)));
    };

    if (auth) signOut();
    if (account && chainId) {
      dispatch(setChainId(chainId));
      dispatch(setAddress(account));
      if (chainId === 1) updateITO();
      return;
    }

    dispatch(setChainId(undefined));
    dispatch(setAddress(undefined));
  }, [account]);
};
