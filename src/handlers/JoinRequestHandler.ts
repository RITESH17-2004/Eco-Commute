import { db } from "../firebase";
import { doc, setDoc, collection, updateDoc, Timestamp, arrayUnion } from "firebase/firestore";

/**
 * Sends a join request to the trip owner.
 * @param tripId - The ID of the trip.
 * @param tripOwnerId - The user ID of the trip owner.
 * @param requestingUserId - The user ID of the requesting user.
 * @param requestingUserName - The name of the requesting user.
 */
export async function sendJoinRequest(
    tripId: string,
    tripOwnerId: string,
    requestingUserId: string,
    requestingUserName: string,
    source: string,
    destination: string
  ): Promise<void> {
    if (!requestingUserId) {
      alert("You must be logged in to request to join a trip.");
      return;
    }
  
    try {
      // Create request in trip owner's requests collection
      const requestDocRef = doc(collection(db, "users", tripOwnerId, "requests"), tripId);
  
      const requestData = {
        tripId,
        requesterId: requestingUserId,
        requesterName: requestingUserName,
        source,
        destination,
        status: "pending", // Status can later be updated to "accepted" or "declined"
        timestamp: Timestamp.now(),
      };
  
      await setDoc(requestDocRef, requestData);
      
      // Also create a record in the requesting user's sent requests collection
      const sentRequestRef = doc(collection(db, "users", requestingUserId, "sentRequests"), tripId);
      await setDoc(sentRequestRef, {
        ...requestData,
        tripOwnerId // Include trip owner ID for reference
      });
      
      alert("Request sent successfully!");
    } catch (error) {
      console.error("Error sending request:", error);
      alert("Failed to send request. Please try again.");
    }
  }
  
/**
 * Allows the trip owner to respond to a join request.
 * @param tripOwnerId - The trip owner's user ID.
 * @param tripId - The trip ID.
 * @param requesterId - The ID of the user who sent the request.
 * @param response - "accepted" or "declined".
 */
export async function respondToJoinRequest(
    tripOwnerId: string,
    tripId: string,
    requesterId: string,
    response: "accepted" | "declined"
  ): Promise<void> {
    try {
      // Update the request status for trip owner
      const requestDocRef = doc(db, "users", tripOwnerId, "requests", tripId);
      await updateDoc(requestDocRef, { status: response });
      
      // Update the sent request status for the requester
      const sentRequestRef = doc(db, "users", requesterId, "sentRequests", tripId);
      await updateDoc(sentRequestRef, { status: response });
  
      // Add notification for the requester
      const requesterNotificationRef = doc(db, "users", requesterId, "notifications", tripId);
      await setDoc(requesterNotificationRef, {
        message: `Your request to join trip ${tripId} was ${response}.`,
        timestamp: Timestamp.now(),
      });
  
      // Handle trip owner's accepted requests
      if (response === "accepted") {
        const tripDocRef = doc(db, "trips", tripId);
        await updateDoc(tripDocRef, {
          acceptedRequests: arrayUnion({
            tripId,
            requesterId,
            status: "accepted",
            timestamp: Timestamp.now(),
          }),
        });
      }
  
      alert(`Request ${response} successfully!`);
    } catch (error) {
      console.error("Error responding to request:", error);
      alert("Failed to update request. Please try again.");
    }
  }