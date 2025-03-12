// src/utils/tripRequests.ts
import { collection, addDoc, doc, getDoc, where, query, getDocs, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

// Interface for trip request
interface TripRequest {
  userId: string;
  userName: string;
  tripId: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestedAt: any; // Timestamp
  requestedSeats: number;
  message?: string;
  source?: string;
  destination?: string;
}

// Function to send a join request
export const requestToJoinTrip = async (
  tripId: string, 
  tripOwnerId: string,
  requestedSeats: number = 1,
  message: string = '',
  source: string = '',
  destination: string = ''
) => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('You must be logged in to request joining a trip');
    }
    
    // Get user info
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userSnapshot = await getDoc(userDocRef);
    
    if (!userSnapshot.exists()) {
      throw new Error('User profile not found');
    }
    
    const userData = userSnapshot.data();
    const userName = userData.name || 'Anonymous User';
    
    // Create request object
    const requestData: TripRequest = {
      userId: currentUser.uid,
      userName: userName,
      tripId: tripId,
      status: 'pending',
      requestedAt: Timestamp.now(),
      requestedSeats: requestedSeats,
      message: message,
      source: source,
      destination: destination
    };
    
    // Add request to global trip requests collection
    const requestsCollectionRef = collection(db, 'tripRequests');
    const newRequestRef = await addDoc(requestsCollectionRef, requestData);
    
    // Also add to the trip owner's requests subcollection for easier querying
    const ownerDocRef = doc(db, 'users', tripOwnerId);
    const ownerTripRequestsRef = collection(ownerDocRef, 'tripRequests');
    await addDoc(ownerTripRequestsRef, {
      ...requestData,
      requestId: newRequestRef.id
    });
    
    // Update the trip document to include this request ID
    const tripDocRef = doc(db, 'trips', tripId);
    await updateDoc(tripDocRef, {
      pendingRequests: arrayUnion({
        requestId: newRequestRef.id,
        userId: currentUser.uid,
        userName: userName,
        requestedSeats: requestedSeats,
        requestedAt: Timestamp.now(),
        source: source,
        destination: destination
      })
    });
    
    return {
      success: true,
      requestId: newRequestRef.id,
      message: 'Request sent successfully'
    };
    
  } catch (error) {
    console.error("Error sending join request:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Function to check if user has already requested to join this trip
export const hasUserRequestedTrip = async (tripId: string) => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return false; // Not logged in, so no requests
    }
    
    const requestsCollectionRef = collection(db, 'tripRequests');
    const q = query(
      requestsCollectionRef,
      where("tripId", "==", tripId),
      where("userId", "==", currentUser.uid)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
    
  } catch (error) {
    console.error("Error checking user requests:", error);
    return false;
  }
};

// Function to get all user's requests (both pending and accepted)
export const getUserRequests = async (userId: string) => {
  try {
    const requestsCollectionRef = collection(db, 'users', userId, 'requests');
    const pendingQuery = query(requestsCollectionRef, where("status", "==", "pending"));
    const acceptedQuery = query(requestsCollectionRef, where("status", "==", "accepted"));
    
    const pendingSnapshot = await getDocs(pendingQuery);
    const acceptedSnapshot = await getDocs(acceptedQuery);
    
    const pendingRequests = pendingSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const acceptedRequests = acceptedSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return {
      pending: pendingRequests,
      accepted: acceptedRequests
    };
  } catch (error) {
    console.error("Error fetching user requests:", error);
    return {
      pending: [],
      accepted: []
    };
  }
};