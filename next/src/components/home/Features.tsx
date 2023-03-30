import Link from 'next/link';
import styles from './Home.module.scss';

const Features = () => {
  return (
    <section className={styles['features']} id='features'>
      <h2 className={styles['section-title']}>Features</h2>
      <div className={styles['grid']}>
        {links.map((l, i) => {
          const { link, title, subtitle, description, image, action } = l;
          return (
            <Link href={link} key={i}>
              <a title={title}>
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
                  <span className={styles['btn-sm']}>
                    {action.toUpperCase()}
                  </span>
                </div>
              </a>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

const links = [
  {
    link: '/store',
    title: 'Store',
    subtitle: 'Shop and earn rewards',
    description: 'A multi-level online store.',
    image: '/images/shopping.svg',
    action: 'Shop',
  },
  {
    link: '/user',
    title: 'My Wallet',
    subtitle: 'Sign in with Ethereum',
    description: 'Sign in with your wallet.',
    image: '/images/siwe.svg',
    action: 'Sign In',
  },
  {
    link: '/mlm/u',
    title: 'MLM',
    subtitle: 'Multi-level marketing',
    description: 'Earn referral commission.',
    image: '/images/team.svg',
    action: 'Join',
  },
];

export default Features;
