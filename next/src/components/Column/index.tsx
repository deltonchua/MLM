import React, { ReactNode } from 'react';
import styles from './Column.module.scss';

const Column = ({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) => {
  return (
    <div className={styles['container']}>
      {title && <h3 className={styles['title']}>{title}</h3>}
      <div className={styles['body']}>{children}</div>
      {description && <p className={styles['description']}>{description}</p>}
    </div>
  );
};

export default Column;
