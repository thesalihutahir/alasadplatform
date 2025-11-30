// lib/firestore-utils.js

import { db } from './firebase'; // Import the initialized Firestore instance
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";

/**
 * Fetches the latest News and Updates for the homepage.
 * @param {number} count - The number of posts to fetch.
 * @returns {Array} An array of news objects.
 */
export async function getLatestNews(count = 3) {
  try {
    const q = query(
      collection(db, "news"),
      orderBy("date", "desc"),
      limit(count)
    );
    const querySnapshot = await getDocs(q);
    
    // Map data to include the document ID
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching latest news:", error);
    return [];
  }
}

/**
 * Fetches all active Programs for the Programs page.
 * @returns {Array} An array of program objects.
 */
export async function getAllPrograms() {
  try {
    const q = query(
      collection(db, "programs"),
      orderBy("order", "asc") // Assume programs have an 'order' field
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching all programs:", error);
    return [];
  }
}

/**
 * Fetches upcoming events for the homepage.
 * @returns {Array} An array of upcoming event objects.
 */
export async function getUpcomingEvents() {
    try {
        const now = new Date();
        const q = query(
            collection(db, "events"),
            where("dateStart", ">=", now.toISOString()), // Filter by date greater than today
            orderBy("dateStart", "asc"),
            limit(2) // Get the next two events
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching upcoming events:", error);
        return [];
    }
}
