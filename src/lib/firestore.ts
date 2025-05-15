import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  deleteDoc,
  getDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { Grievance, UserProfile, TeaPost } from './types';

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

// Tea post functions
export const addTeaPost = async (teaPost: Omit<TeaPost, 'id' | 'upvotes' | 'upvotedBy'>) => {
  return addDoc(collection(db, 'teaPosts'), {
    ...teaPost,
    createdAt: Date.now(),
    upvotes: 0,
    upvotedBy: [],
  });
};

export const getAllTeaPosts = async (limitCount: number = 20): Promise<TeaPost[]> => {
  try {
    const teaPostsQuery = query(
      collection(db, 'teaPosts'),
      orderBy('upvotes', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(teaPostsQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as TeaPost));
  } catch (error) {
    console.error("Error fetching tea posts:", error);
    return [];
  }
};

export const getUserTeaPosts = async (uid: string): Promise<TeaPost[]> => {
  if (!uid) {
    console.error("No user ID provided for getUserTeaPosts");
    return [];
  }
  
  try {
    const teaPostsQuery = query(
      collection(db, 'teaPosts'),
      where('authorUid', '==', uid),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(teaPostsQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as TeaPost));
  } catch (error) {
    console.error("Error fetching user tea posts:", error);
    return [];
  }
};

export const upvoteTeaPost = async (postId: string, userId: string) => {
  const postRef = doc(db, 'teaPosts', postId);
  const postDoc = await getDoc(postRef);
  
  if (!postDoc.exists()) {
    throw new Error("Post not found");
  }
  
  const post = postDoc.data() as TeaPost;
  
  if (post.upvotedBy.includes(userId)) {
    // User has already upvoted, remove upvote
    await updateDoc(postRef, {
      upvotes: post.upvotes - 1,
      upvotedBy: arrayRemove(userId)
    });
  } else {
    // User hasn't upvoted, add upvote
    await updateDoc(postRef, {
      upvotes: post.upvotes + 1,
      upvotedBy: arrayUnion(userId)
    });
  }
};

export const deleteTeaPost = async (id: string) => {
  const teaPostRef = doc(db, 'teaPosts', id);
  await deleteDoc(teaPostRef);
};