import { useRouter } from 'next/router';
import ArrowLeftIcon from '../../icons/ArrowLeft';
import styles from './Header.module.scss';

const PageHeader = ({
  link,
  linkTitle = 'Back',
  title,
}: {
  link?: string;
  linkTitle?: string;
  title?: string;
}) => {
  const router = useRouter();
  return (
    <header className={styles['page-header']}>
      <div className={styles['container-md']}>
        <button
          title={linkTitle}
          onClick={() => {
            link ? router.push(link) : router.back();
          }}
        >
          <ArrowLeftIcon />
          <span>{linkTitle}</span>
        </button>
        <h3>{title}</h3>
        <div />
      </div>
    </header>
  );
};

export default PageHeader;
