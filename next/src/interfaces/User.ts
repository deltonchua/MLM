export interface UserInterface {
  uid: string;
  name?: string;
  displayName?: string;
  displayNameSlug?: string;
  photoURL?: string;
  email?: string;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  emailSent?: number;
  phoneNumber?: string;
  member?: boolean;
}
