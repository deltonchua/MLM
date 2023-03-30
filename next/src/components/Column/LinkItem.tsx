import Link from 'next/link';
import { SVGProps } from 'react';
import ArrowRightIcon from '../../icons/ArrowRight';
import styles from './Column.module.scss';

const LinkItem = ({ link, external, Img, name, status }: LinkItemInterface) => {
  const Content = (
    <>
      {!Img ? null : typeof Img === 'string' ? (
        <img src={Img} alt='' />
      ) : (
        <Img />
      )}
      <div>
        <span>{name}</span>
        {status && <span className={styles['status']}>{status}</span>}
        <ArrowRightIcon className={styles['icon']} />
      </div>
    </>
  );

  return link.startsWith('http') || external ? (
    <a
      href={link}
      target='_blank'
      rel='noopener noreferrer'
      className={styles['btn-content']}
      title={name}
    >
      {Content}
    </a>
  ) : (
    <Link href={link}>
      <a className={styles['btn-content']} title={name}>
        {Content}
      </a>
    </Link>
  );
};

export interface LinkItemInterface {
  link: string;
  external?: boolean;
  Img?: string | ((props: SVGProps<SVGSVGElement>) => JSX.Element);
  name: string;
  status?: string;
}

export default LinkItem;
