/**
 * Script to clean up stale connections and presence data from Realtime Database
 * Run with: npx tsx scripts/cleanup-presence.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(path.join(__dirname, '..', 'serviceAccountKey.json')),
  databaseURL: 'https://canvisia-ab47b-default-rtdb.firebaseio.com'
});

const db = getDatabase(app);

async function cleanupPresence() {
  console.log('🧹 Starting presence cleanup...');

  try {
    // Get all projects
    const projectsSnapshot = await db.ref('connections').once('value');
    const projects = projectsSnapshot.val();

    if (!projects) {
      console.log('No connections found');
      return;
    }

    let totalConnectionsRemoved = 0;
    let totalUsersUpdated = 0;

    // Iterate through each project
    for (const [projectId, users] of Object.entries(projects as Record<string, any>)) {
      console.log(`\n📊 Project: ${projectId}`);

      // Iterate through each user
      for (const [userId, connections] of Object.entries(users as Record<string, any>)) {
        const connectionCount = Object.keys(connections).length;
        console.log(`  User ${userId}: ${connectionCount} connection(s)`);

        // Remove all connections for this user
        await db.ref(`connections/${projectId}/${userId}`).remove();
        totalConnectionsRemoved += connectionCount;

        // Set presence to inactive
        await db.ref(`presence/${projectId}/${userId}`).update({
          isActive: false,
          lastSeen: Date.now()
        });
        totalUsersUpdated++;

        console.log(`  ✅ Removed ${connectionCount} connection(s), set presence to inactive`);
      }
    }

    console.log(`\n✅ Cleanup complete!`);
    console.log(`   - Connections removed: ${totalConnectionsRemoved}`);
    console.log(`   - Users updated: ${totalUsersUpdated}`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  } finally {
    await app.delete();
  }
}

// Run cleanup
cleanupPresence()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
