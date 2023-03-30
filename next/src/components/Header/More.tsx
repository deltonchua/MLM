import Modal from '../Modal';
import Column from '../Column';
import LinkItem, { LinkItemInterface } from '../Column/LinkItem';
import HomeIcon from '../../icons/Home';
import StoreIcon from '../../icons/Store';
import UserIcon from '../../icons/User';
import DiamondIcon from '../../icons/Diamond';
import ArticleIcon from '../../icons/Article';
import PolicyIcon from '../../icons/Policy';
import MailIcon from '../../icons/Mail';
import styles from './Header.module.scss';

const Content = () => (
  <div className={styles['more']}>
    <Column title='Apps'>
      {apps.map((a, i) => (
        <LinkItem {...a} key={i} />
      ))}
    </Column>
    <Column title='Community'>
      {community.map((c, i) => (
        <LinkItem {...c} key={i} />
      ))}
    </Column>
    <Column title='Legal'>
      {legal.map((c, i) => (
        <LinkItem {...c} key={i} />
      ))}
    </Column>
  </div>
);

const More = ({ hideModal }: { hideModal: () => void }) => (
  <Modal title='More' hideModal={hideModal}>
    <Content />
  </Modal>
);

export default More;

const apps: LinkItemInterface[] = [
  {
    link: '/',
    name: 'Home',
    Img: HomeIcon,
  },
  { link: '/store', name: 'Store', Img: StoreIcon },
  { link: '/user', name: 'User Profile', Img: UserIcon },
  {
    link: '/mlm/u',
    name: 'Multi-level Marketing',
    Img: DiamondIcon,
  },
];

const community: LinkItemInterface[] = [
  {
    link: 'https://twitter.com',
    name: 'Twitter',
    Img: '/images/twitter.svg',
  },
  {
    link: 'https://www.reddit.com',
    name: 'Reddit',
    Img: '/images/reddit.svg',
  },
  {
    link: 'https://www.facebook.com',
    name: 'Facebook',
    Img: '/images/facebook.svg',
  },
  {
    link: 'mailto:contact@bigfamily.world',
    name: 'Email',
    Img: MailIcon,
  },
];

const legal: LinkItemInterface[] = [
  {
    link: '/terms',
    name: 'Terms of Service',
    Img: ArticleIcon,
  },
  {
    link: '/privacy',
    name: 'Privacy Policy',
    Img: PolicyIcon,
  },
];
