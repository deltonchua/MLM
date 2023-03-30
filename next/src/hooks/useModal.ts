import { useState } from 'react';

const useModal = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const showModal = () => setModalOpen(true);
  const hideModal = () => setModalOpen(false);

  return { modalOpen, showModal, hideModal };
};

export default useModal;
