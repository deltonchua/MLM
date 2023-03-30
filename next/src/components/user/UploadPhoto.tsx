import { useState, useMemo, ChangeEvent } from 'react';
import { httpsCallable } from 'firebase/functions';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectUser, setUser } from '../../slices/userSlice';
import { UserInterface } from '../../interfaces/User';
import useToast from '../../hooks/useToast';
import { useFunctions } from '../../hooks/firebase';
import { IMG_EXTENSION, MAX_FILE_SIZE } from '../../utils/constants';
import Modal from '../Modal';
import UserIcon from '../../icons/User';
import styles from './User.module.scss';
import Loader from '../Loader';

const UploadPhoto = ({ hideModal }: { hideModal: () => void }) => {
  const { photoURL } = useAppSelector(selectUser) as UserInterface;
  const [photoSrc, setPhotoSrc] = useState(photoURL || '');
  const [photoName, setPhotoName] = useState('');
  const [loading, setLoading] = useState(false);

  const functions = useFunctions();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const onPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const photo = e.target.files ? e.target.files[0] : null;
    if (photo && photo.size > MAX_FILE_SIZE)
      toast('Error: File size exceeds 1MB.');
    if (
      photo &&
      photo.type.startsWith('image/') &&
      IMG_EXTENSION.includes('.' + photo.name.split('.').at(-1)) &&
      photo.size <= MAX_FILE_SIZE
    ) {
      setPhotoName(e.target.value);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target) setPhotoSrc(e.target.result as string);
      };
      reader.readAsDataURL(photo);
      return;
    }
    setPhotoName('');
  };

  const enabled = useMemo(() => photoSrc && photoSrc !== photoURL, [
    photoSrc,
    photoURL,
  ]);

  const onDone = async () => {
    if (!enabled) return;
    try {
      setLoading(true);
      const res = await httpsCallable(
        functions,
        'uploadPhoto'
      )({ photo: photoSrc });
      toast(res.data as string);
      const { data } = await httpsCallable(functions, 'getUser')();
      dispatch(setUser(data as UserInterface));
    } catch (err) {
      console.error(err);
      toast(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title='Upload Photo'
      hideModal={hideModal}
      onDone={onDone}
      disabled={loading || !enabled}
    >
      <div className={styles['form-column']}>
        <div className={styles['photo-preview']}>
          <div className={styles['img']}>
            {photoSrc ? <img src={photoSrc} alt='' /> : <UserIcon />}
          </div>
          <input
            type='file'
            name='photo'
            id='photo'
            placeholder='Your photo (Max 1MB)'
            accept={IMG_EXTENSION.join(',')}
            onChange={onPhotoChange}
            value={photoName}
            required
          />
        </div>
        <label
          htmlFor='photo'
          className={styles['btn-blue-centered']}
          title='Select Photo'
        >
          Select Photo
        </label>
        {loading && <Loader />}
      </div>
    </Modal>
  );
};

export default UploadPhoto;
