import { useRef } from 'react';
import styles from './Modal.module.scss';

const Modal = ({
  title,
  children,
  hideModal,
  onDone,
  disabled = true,
}: {
  title?: string;
  children: JSX.Element;
  hideModal: () => void;
  onDone?: () => void;
  disabled?: boolean;
}) => {
  const modal = useRef<HTMLDivElement | null>(null);

  return (
    <div
      className={styles['overlay']}
      onClick={(e) => {
        const el = modal?.current;
        if (!el || el.contains(e.target as Node)) {
          return;
        }
        hideModal();
      }}
    >
      <div className={styles['modal']} ref={modal}>
        {title && (
          <header>
            {onDone ? (
              <button onClick={hideModal} title='Cancel'>
                Cancel
              </button>
            ) : (
              <div />
            )}
            <h3>{title}</h3>
            <button
              onClick={async () => {
                if (onDone) await onDone();
                hideModal();
              }}
              title='Done'
              disabled={onDone ? disabled : false}
            >
              Done
            </button>
          </header>
        )}
        <div className={styles['body']}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
