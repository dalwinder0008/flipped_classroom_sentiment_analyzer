import { Review, Stats } from "../types";
import { db, auth, storage } from "./firebase";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  orderBy, 
  where, 
  limit, 
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
  UPLOAD = 'upload'
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const api = {
  async ping(): Promise<boolean> {
    try {
      // Test connection to Firestore
      await getDocFromServer(doc(db, 'test', 'connection'));
      return true;
    } catch (error) {
      if(error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
        return false;
      }
      // Other errors are fine for a ping
      return true;
    }
  },

  async getReviews(): Promise<Review[]> {
    const path = 'reviews';
    try {
      const q = query(collection(db, 'reviews'), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async submitReview(reviewData: any): Promise<{ success: boolean }> {
    const path = 'reviews';
    try {
      const docRef = doc(collection(db, 'reviews'));
      await setDoc(docRef, {
        ...reviewData,
        id: docRef.id,
        created_at: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return { success: false };
    }
  },

  async getStats(): Promise<Stats> {
    try {
      const reviews = await this.getReviews();
      const total = reviews.length;
      const sentiments: Record<string, number> = { "Positive": 0, "Neutral": 0, "Negative": 0 };
      let totalRating = 0;
      const uniqueStudents = new Set<string>();

      // Radar data accumulation
      const dimensionsSum = {
        clarity: 0, engagement: 0, pacing: 0, difficulty: 0, resources: 0, support: 0
      };
      let reviewsWithDimensions = 0;

      // Trend data accumulation (last 7 days)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          name: days[d.getDay()],
          date: d.toISOString().split('T')[0],
          positive: 0,
          negative: 0,
          neutral: 0
        };
      });

      reviews.forEach(r => {
        // Normalize sentiment for counting (handle potential case issues)
        const s = r.sentiment ? (r.sentiment.charAt(0).toUpperCase() + r.sentiment.slice(1).toLowerCase()) : "Neutral";
        if (sentiments[s] !== undefined) {
          sentiments[s]++;
        } else {
          sentiments["Neutral"]++;
        }

        totalRating += r.rating || 0;
        if (r.email) uniqueStudents.add(r.email.toLowerCase());

        if (r.dimensions) {
          dimensionsSum.clarity += r.dimensions.clarity || 50;
          dimensionsSum.engagement += r.dimensions.engagement || 50;
          dimensionsSum.pacing += r.dimensions.pacing || 50;
          dimensionsSum.difficulty += r.dimensions.difficulty || 50;
          dimensionsSum.resources += r.dimensions.resources || 50;
          dimensionsSum.support += r.dimensions.support || 50;
          reviewsWithDimensions++;
        }

        if (r.created_at) {
          const reviewDate = r.created_at.split('T')[0];
          const trendDay = last7Days.find(d => d.date === reviewDate);
          if (trendDay) {
            if (s === "Positive") trendDay.positive++;
            else if (s === "Negative") trendDay.negative++;
            else trendDay.neutral++;
          }
        }
      });

      console.log("Stats Calculation:", {
        total,
        sentiments,
        activeStudents: uniqueStudents.size,
        reviewsWithDimensions
      });

      const radarData = [
        { subject: 'Clarity', A: reviewsWithDimensions > 0 ? dimensionsSum.clarity / reviewsWithDimensions : 50, B: 70, fullMark: 100 },
        { subject: 'Engagement', A: reviewsWithDimensions > 0 ? dimensionsSum.engagement / reviewsWithDimensions : 50, B: 75, fullMark: 100 },
        { subject: 'Pacing', A: reviewsWithDimensions > 0 ? dimensionsSum.pacing / reviewsWithDimensions : 50, B: 65, fullMark: 100 },
        { subject: 'Difficulty', A: reviewsWithDimensions > 0 ? dimensionsSum.difficulty / reviewsWithDimensions : 50, B: 80, fullMark: 100 },
        { subject: 'Resources', A: reviewsWithDimensions > 0 ? dimensionsSum.resources / reviewsWithDimensions : 50, B: 70, fullMark: 100 },
        { subject: 'Support', A: reviewsWithDimensions > 0 ? dimensionsSum.support / reviewsWithDimensions : 50, B: 60, fullMark: 100 },
      ];

      return {
        total,
        sentiments,
        avgRating: total > 0 ? totalRating / total : 0,
        activeStudents: uniqueStudents.size,
        trendData: last7Days.map(({ name, positive, negative, neutral }) => ({ name, positive, negative, neutral })),
        radarData
      };
    } catch (error) {
      console.error("Error calculating stats:", error);
      return { 
        total: 0, 
        sentiments: { "Positive": 0, "Neutral": 0, "Negative": 0 }, 
        avgRating: 0, 
        activeStudents: 0,
        trendData: [],
        radarData: []
      };
    }
  },

  async getUserReviews(email: string): Promise<Review[]> {
    const path = 'reviews';
    try {
      const q = query(
        collection(db, 'reviews'), 
        where('email', '==', email),
        orderBy('created_at', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getProfile(uid: string): Promise<any> {
    const path = `users/${uid}`;
    if (!uid) return null;
    try {
      const docRef = doc(db, 'users', uid);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return snapshot.data();
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async updateProfile(profileData: any): Promise<{ success: boolean }> {
    const path = `users/${profileData.uid}`;
    try {
      // Ensure required fields for rules and schema
      const data = {
        uid: profileData.uid,
        email: profileData.email,
        display_name: profileData.display_name || profileData.displayName || '',
        photo_url: profileData.photo_url || profileData.photoURL || '',
        phone_number: profileData.phone_number || profileData.phoneNumber || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        role: profileData.role || 'student',
        joined: profileData.joined || new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', profileData.uid), data, { merge: true });
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return { success: false };
    }
  },

  async updateReview(reviewId: string, reviewData: any): Promise<{ success: boolean }> {
    const path = `reviews/${reviewId}`;
    try {
      const docRef = doc(db, 'reviews', reviewId);
      await updateDoc(docRef, {
        ...reviewData,
        updated_at: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      return { success: false };
    }
  },

  async deleteReview(reviewId: string): Promise<{ success: boolean }> {
    const path = `reviews/${reviewId}`;
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      return { success: false };
    }
  },

  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPLOAD, path);
      throw error;
    }
  }
};
