import { useEffect, useMemo } from 'react';
import { getApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  connectAuthEmulator,
} from 'firebase/auth';
import {
  getFunctions,
  httpsCallable,
  connectFunctionsEmulator,
} from 'firebase/functions';
import { useWeb3React } from '@web3-react/core';
import useSignMessage from './useSignMessage';
import { useAppDispatch } from '../app/hooks';
import { setAuth } from '../slices/authSlice';
import { setUser } from '../slices/userSlice';
import { UserInterface } from '../interfaces/User';
import useToast from './useToast';
import { timeout } from '../utils/time';

export const useAuthListener = () => {
  const functions = useFunctions();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const auth = getAuth(getApp());
    if (process.env.NODE_ENV === 'development')
      connectAuthEmulator(auth, 'http://localhost:9099');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { uid } = user;
        let member = false;
        try {
          const idTokenResult = await user.getIdTokenResult();
          member = !!idTokenResult.claims.member;
          const { data } = await httpsCallable(functions, 'getUser')();
          dispatch(setUser(data as UserInterface));
        } catch (err) {
          console.error(err);
        }
        dispatch(setAuth({ uid, member }));
        return;
      }
      dispatch(setAuth(null));
      dispatch(setUser(null));
    });
    return () => unsubscribe();
  }, []);
};

export const useAuth = () => {
  const auth = getAuth(getApp());
  const { deactivate } = useWeb3React();
  const signMessage = useSignMessage();
  const functions = useFunctions();
  const toast = useToast();

  const signIn = async () => {
    try {
      const signature = await signMessage('Sign In');
      const res = await httpsCallable(functions, 'signIn')(signature);
      await signInWithCustomToken(auth, res.data as string);
      await timeout(3000);
      toast('You are signed in.');
    } catch (err) {
      console.error(err);
      toast(`Error: ${(err as Error).message}`);
    }
  };

  const signOut = () => {
    try {
      deactivate();
      firebaseSignOut(auth);
    } catch (err) {
      console.error(err);
      toast(`Error: ${(err as Error).message}`);
    }
  };

  const refreshToken = () => {
    auth.currentUser?.getIdToken(true);
  };

  return { signIn, signOut, refreshToken };
};

export const useFunctions = () => {
  const functions = useMemo(
    () => getFunctions(getApp(), process.env.NEXT_PUBLIC_FIREBASE_REGION),
    []
  );
  if (process.env.NODE_ENV === 'development')
    connectFunctionsEmulator(functions, 'localhost', 5001);
  return functions;
};

export const useEmulators = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const app = getApp();
  const auth = getAuth(app);
  connectAuthEmulator(auth, 'http://localhost:9099');

  const functions = getFunctions(app);
  connectFunctionsEmulator(functions, 'localhost', 5001);
};
