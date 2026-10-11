import { initDatabase, db } from './src/lib/db.ts';

console.log('Running database migrations and initialization...');
initDatabase();

const count = db.prepare('SELECT count(*) as total FROM content_calendar').get() as { total: number };
console.log(`✓ Migration success! Total content_calendar rows: ${count.total}`);
