import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { store } from '../app/store';
import { Web3ReactProvider } from '@web3-react/core';
import getLibrary from '../utils/getLibrary';
import useOnRouteChange from '../hooks/useOnRouteChange';
import useWindowSize from '../hooks/useWindowSize';
import GoogleAnalytics from '../components/GoogleAnalytics';
import FirebaseManager from '../components/FirebaseManager';
import Web3ReactManager from '../components/Web3ReactManager';
import PageLoader from '../components/PageLoader';
import Header from '../components/Header';
import Toast from '../components/Toast';
import '../styles/globals.scss';

const App = ({ Component, pageProps }: AppProps) => {
  const loading = useOnRouteChange();
  useWindowSize();

  return (
    <>
      <GoogleAnalytics />
      <Provider store={store}>
        <FirebaseManager>
          <Web3ReactProvider getLibrary={getLibrary}>
            <Web3ReactManager>
              {loading ? (
                <PageLoader />
              ) : (
                <>
                  <Header />
                  <Component {...pageProps} />
                  <Toast />
                </>
              )}
            </Web3ReactManager>
          </Web3ReactProvider>
        </FirebaseManager>
      </Provider>
    </>
  );
};

export default App;
