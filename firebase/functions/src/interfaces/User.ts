// users/{uid}

export interface UserInterface {
  uid: string;
  name?: string;
  displayName?: string;
  displayNameSlug?: string;
  photoURL?: string;
  email?: string;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  emailSent?: FirebaseFirestore.Timestamp;
  phoneNumber?: string;
  member?: boolean;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
