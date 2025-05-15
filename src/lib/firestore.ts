import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  orderBy,
  deleteDoc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Grievance, UserProfile } from './types';

// User profile functions
export const createUserProfile = async (userData: UserProfile) => {
  await setDoc(doc(db, 'users', userData.uid), {
    uid: userData.uid,
    email: userData.email,
    displayName: userData.displayName || userData.email.split('@')[0],
    createdAt: serverTimestamp(),
  });
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data() as UserProfile;
  }
  return null;
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const usersQuery = query(collection(db, 'users'));
    const querySnapshot = await getDocs(usersQuery);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        email: data.email || '',
        displayName: data.displayName || data.email?.split('@')[0] || 'Unknown User',
      } as UserProfile;
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// Grievance functions
export const addGrievance = async (grievance: Omit<Grievance, 'id'>) => {
  return addDoc(collection(db, 'grievances'), {
    ...grievance,
    createdAt: Date.now(),
    read: false,
  });
};

export const getReceivedGrievances = async (uid: string): Promise<Grievance[]> => {
  if (!uid) {
    console.error("No user ID provided for getReceivedGrievances");
    return [];
  }
  
  try {
    // Use a simple query without the composite index requirement
    const simpleQuery = query(
      collection(db, 'grievances'), 
      where('recipientUid', '==', uid)
    );
    
    const querySnapshot = await getDocs(simpleQuery);
    
    // Sort manually in JavaScript (this way we avoid the need for the index)
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Grievance))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.error("Error fetching received grievances:", error);
    return [];
  }
};

export const getSentGrievances = async (uid: string): Promise<Grievance[]> => {
  if (!uid) {
    console.error("No user ID provided for getSentGrievances");
    return [];
  }
  
  try {
    // Use a simple query without the composite index requirement
    const simpleQuery = query(
      collection(db, 'grievances'), 
      where('senderUid', '==', uid)
    );
    
    const querySnapshot = await getDocs(simpleQuery);
    
    // Sort manually in JavaScript (this way we avoid the need for the index)
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Grievance))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.error("Error fetching sent grievances:", error);
    return [];
  }
};

export const markGrievanceAsRead = async (id: string) => {
  const grievanceRef = doc(db, 'grievances', id);
  await updateDoc(grievanceRef, {
    read: true,
  });
};

export const deleteGrievance = async (id: string) => {
  const grievanceRef = doc(db, 'grievances', id);
  await deleteDoc(grievanceRef);
};