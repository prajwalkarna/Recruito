const db = require('./db');
const fs = require('fs');
const path = require('path');

const initDb = async () => {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
        await db.query(sql);
        console.log('Database tables created successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error creating tables:', err);
        process.exit(1);
    }
};

initDb();
