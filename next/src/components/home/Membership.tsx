import Link from 'next/link';
import styles from './Home.module.scss';

const Membership = () => {
  return (
    <div className={styles['membership']} id='membership'>
      <h2 className={styles['section-title']}>Member Benefits</h2>
      <p>
        All payouts will be settled in{' '}
        <a
          href='https://nomics.com/assets/ito-intime'
          target='_blank'
          rel='noopener noreferrer'
          className={styles['link']}
        >
          InTime (ITO)
        </a>
        .
      </p>
      <div className={styles['grid']}>
        {numbers.map((n, i) => {
          const { title, subtitle, description, image } = n;
          return (
            <div key={i}>
              <div className={styles['top']}>
                <span>{title}</span>
                <h3>{subtitle}</h3>
                <div className={styles['img']}>
                  <img src={image} alt='' />
                </div>
              </div>
              <div className={styles['btm']}>
                <div className={styles['title']}>
                  <p>{title}</p>
                  <span>{description}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const numbers = [
  {
    title: 'Shopping Reward',
    subtitle: '41%',
    description: 'Receive up to 41% reward at point of sale.',
    image: '/images/card.svg',
  },
  {
    title: 'Referral Commission',
    subtitle: '1%',
    description:
      'Sign your friend up and earn 1% commission on every purchase.',
    image: '/images/referral.svg',
  },
  {
    title: 'Overriding',
    subtitle: '9 levels',
    description: 'Up to 9 levels of overriding commission.',
    image: '/images/levels.svg',
  },
];

export default Membership;
