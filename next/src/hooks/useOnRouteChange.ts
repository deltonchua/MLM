import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

const useOnRouteChange = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleStop = () => setLoading(false);
    // const handleComplete = (url: string) => {
    //   handleStop();
    //   (window as any).gtag(
    //     'config',
    //     process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
    //     {
    //       page_path: url,
    //     }
    //   );
    // };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router]);

  return loading;
};

export default useOnRouteChange;
