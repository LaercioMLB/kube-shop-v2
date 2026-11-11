const fs = require('fs');
const appDb = db.getSiblingDB('kubeshop');
appDb.createUser({
  user: process.env.MONGO_APP_USERNAME,
  pwd: fs.readFileSync(process.env.MONGO_APP_PASSWORD_FILE, 'utf8').trim(),
  roles: [{ role: 'readWrite', db: 'kubeshop' }],
});
