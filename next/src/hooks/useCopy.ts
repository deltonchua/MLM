import useToast from './useToast';

const useCopy = () => {
  const toast = useToast();
  const copy = async (text: string, textObject = 'Message') => {
    await navigator.clipboard.writeText(text);
    toast(`${textObject} copied to clipboard.`);
  };
  return copy;
};

export default useCopy;
