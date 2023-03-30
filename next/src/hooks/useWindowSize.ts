import { useEffect } from 'react';

const useWindowSize = () => {
  useEffect(() => {
    const setSize = () => {
      const vh = window.innerHeight / 100;
      const vw = window.innerWidth / 100;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.documentElement.style.setProperty('--vw', `${vw}px`);
    };
    setSize();
    window.addEventListener('resize', setSize);
    return () => window.removeEventListener('resize', setSize);
  }, []);
};

export default useWindowSize;
