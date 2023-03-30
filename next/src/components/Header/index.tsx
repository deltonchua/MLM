import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAppSelector } from '../../app/hooks';
import { selectAddress } from '../../slices/authSlice';
import useCart from '../../hooks/useCart';
import useModal from '../../hooks/useModal';
import Cart from './Cart';
import ConnectWallet from './ConnectWallet';
import MyWallet from './MyWallet';
import More from './More';
import StoreIcon from '../../icons/Store';
import CartIcon from '../../icons/Cart';
import UserIcon from '../../icons/User';
import DiamondIcon from '../../icons/Diamond';
import MoreHorizIcon from '../../icons/MoreHoriz';
import styles from './Header.module.scss';

const Header = () => {
  const router = useRouter();
  const path = router.asPath;
  const address = useAppSelector(selectAddress);
  useCart();
  const {
    modalOpen: CartOpen,
    showModal: showCart,
    hideModal: hideCart,
  } = useModal();
  const {
    modalOpen: WalletOpen,
    showModal: showWallet,
    hideModal: hideWallet,
  } = useModal();
  const {
    modalOpen: MoreOpen,
    showModal: showMore,
    hideModal: hideMore,
  } = useModal();

  return (
    <header className={styles['header']}>
      <div className={styles['container-md']}>
        <Link href='/'>
          <a className={styles['logo']} title='Home'>
            <img src='/images/logo.png' alt='' />
            <h1>Big Family</h1>
          </a>
        </Link>
        <nav>
          <NavItem
            path={path}
            href={'/store'}
            title='Store'
            icon={<StoreIcon />}
          />
          <NavItem onClick={showCart} title='Cart' icon={<CartIcon />} />
          {CartOpen && <Cart hideModal={hideCart} />}
          <NavItem onClick={showWallet} title='User' icon={<UserIcon />} />
          {WalletOpen &&
            (address ? (
              <MyWallet hideModal={hideWallet} />
            ) : (
              <ConnectWallet hideModal={hideWallet} />
            ))}
          <NavItem
            path={path}
            href={'/mlm/u'}
            title='MLM'
            icon={<DiamondIcon />}
          />
          {/* <NavItem
          path={path}
          href={'/search'}
          title='Search'
          icon={<SearchIcon />}
        /> */}
          <NavItem
            onClick={showMore}
            title='More'
            hideTitle={true}
            icon={<MoreHorizIcon />}
          />
          {MoreOpen && <More hideModal={hideMore} />}
        </nav>
      </div>
    </header>
  );
};

const NavItem = ({
  path,
  href,
  title,
  hideTitle = false,
  icon,
  onClick,
}: {
  path?: string;
  href?: string;
  title: string;
  hideTitle?: boolean;
  icon: JSX.Element;
  onClick?: () => void;
}) =>
  href && path ? (
    <Link href={href}>
      <a
        className={path.startsWith(href) ? styles['active'] : undefined}
        title={title}
      >
        {icon}
        <span className={hideTitle ? styles['hide'] : undefined}>{title}</span>
      </a>
    </Link>
  ) : onClick ? (
    <button onClick={onClick} title={title}>
      {icon}
      <span className={hideTitle ? styles['hide'] : undefined}>{title}</span>
    </button>
  ) : null;

export default Header;
