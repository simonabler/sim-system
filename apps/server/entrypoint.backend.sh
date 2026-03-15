#!/bin/sh
set -e

# .env aus /app/.env laden (Docker mountet es als Volume dorthin)
# Nur wenn vorhanden – in reinen ENV-Var-Setups (CI, k8s) nicht nötig
if [ -f "/app/.env" ]; then
  set -o allexport
  . /app/.env
  set +o allexport
fi

echo "[sims] Running database migrations..."
node -e "
const { DataSource } = require('typeorm');
const path = require('path');

const ds = new DataSource({
  type: 'postgres',
  host:     process.env.TYPEORM_HOST     || 'localhost',
  port:     Number(process.env.TYPEORM_PORT || 5432),
  username: process.env.TYPEORM_USERNAME || 'user',
  password: process.env.TYPEORM_PASSWORD || 'CHANGEME',
  database: process.env.TYPEORM_DATABASE || 'sims',
  entities:   [],
  migrations: [path.join(__dirname, 'migrations', '*.js')],
  synchronize:   false,
  migrationsRun: false,
});

ds.initialize()
  .then(() => ds.runMigrations())
  .then((ran) => {
    if (ran.length === 0) {
      console.log('[sims] No pending migrations.');
    } else {
      console.log('[sims] Migrations applied: ' + ran.map(function(m){ return m.name; }).join(', '));
    }
    return ds.destroy();
  })
  .then(() => process.exit(0))
  .catch(function(e) {
    console.error('[sims] Migration failed:', e.message);
    process.exit(1);
  });
"

echo "[sims] Starting app..."
node main.js
