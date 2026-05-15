import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { SqliteConfigService } from '../../../config/database/sqlite/config.service';
import { SqliteConfigModule } from '../../../config/database/sqlite/config.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [SqliteConfigModule],
      useFactory: async (sqliteConfigService: SqliteConfigService) => ({
        type: 'better-sqlite3' as any,
        database: sqliteConfigService.path,
        entities: [sqliteConfigService.entities],
        migrations: ['dist/migration/*.js'],
        migrationsRun: sqliteConfigService.migrationsRun,
        synchronize: sqliteConfigService.synchronizeRun,
        logging: sqliteConfigService.logging,
      }),
      inject: [SqliteConfigService],
    } as TypeOrmModuleAsyncOptions),
  ],
})
export class SqliteDatabaseProviderModule {}
