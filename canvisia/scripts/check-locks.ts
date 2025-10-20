import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = initializeApp({
  credential: cert(path.join(__dirname, '..', 'serviceAccountKey.json')),
  databaseURL: 'https://canvisia-ab47b-default-rtdb.firebaseio.com'
});

const db = getDatabase(app);

async function checkLocks() {
  console.log('🔍 Checking for AI locks...');

  const snapshot = await db.ref('canvases').once('value');
  const canvases = snapshot.val();

  if (!canvases) {
    console.log('No canvases found');
    await app.delete();
    return;
  }

  let foundLocks = 0;
  for (const [canvasId, canvasData] of Object.entries(canvases as any)) {
    if (canvasData.aiLock) {
      foundLocks++;
      console.log(`\n🔒 Lock found in canvas ${canvasId}:`, canvasData.aiLock);
      console.log('Age:', Date.now() - canvasData.aiLock.timestamp, 'ms');

      // Remove stale locks (older than 10 seconds)
      if (Date.now() - canvasData.aiLock.timestamp > 10000) {
        console.log('Removing stale lock...');
        await db.ref(`canvases/${canvasId}/aiLock`).remove();
        console.log('✅ Removed');
      }
    }
  }

  if (foundLocks === 0) {
    console.log('No locks found');
  }

  console.log('\n✅ Done');
  await app.delete();
}

checkLocks().catch(console.error);
