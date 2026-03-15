import { DatabaseType } from 'typeorm';
import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { SqliteConfigService } from 'src/config/database/sqlite/config.service';
import { SqliteConfigModule } from 'src/config/database/sqlite/config.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [SqliteConfigModule],
      useFactory: async (sqliteConfigService: SqliteConfigService) => ({
        type: 'sqlite' as DatabaseType,
        database: sqliteConfigService.path,
        entities: [sqliteConfigService.entities],
        migrations: ['dist/migration/*.js'],
        migrationsRun: sqliteConfigService.migrationsRun,

    /*  cli: {
          migrationsDir: 'src/migration',
        },*/
        synchronize: sqliteConfigService.synchronizeRun,
        logging: true,
      }),
      inject: [SqliteConfigService],
    } as TypeOrmModuleAsyncOptions),
  ],
})
export class SqliteDatabaseProviderModule {}
