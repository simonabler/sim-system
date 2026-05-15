import { registerAs } from '@nestjs/config';

export default registerAs('sqlite', () => ({
  path: process.env.SQLITE_PATH,
  migrationsRun: process.env.SQLITE_RUN_MIGRATION,
  synchronizeRun: process.env.SQLITE_RUN_SYNCHRONIZE,
  entities: process.env.SQLITE_ENTITIES,
  logging: process.env.SQLITE_LOGGING,
}));
