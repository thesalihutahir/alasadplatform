import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const logAudit = async ({ action, entityType, entityId, summary, actor, before = null, after = null }) => {
    try {
        await addDoc(collection(db, 'audit_logs'), {
            action,
            entityType,
            entityId: entityId || 'N/A',
            summary,
            actor: {
                uid: actor.uid,
                email: actor.email,
                role: actor.role,
                displayName: actor.displayName
            },
            before,
            after,
            createdAt: serverTimestamp(),
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'
        });
    } catch (error) {
        console.error("Failed to log audit:", error);
        // We don't throw here to avoid breaking the main user flow if logging fails
    }
};
