const fs = require('fs');
const appDb = db.getSiblingDB('kubeshop');
const password = fs.readFileSync(process.env.MONGO_APP_PASSWORD_FILE, 'utf8').trim();
if (!appDb.auth(process.env.MONGO_APP_USERNAME, password).ok) quit(1);
if (appDb.runCommand({ ping: 1 }).ok !== 1) quit(1);
