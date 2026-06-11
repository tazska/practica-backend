import { existsSync, readFileSync } from 'fs';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { DatabaseInitService } from './database-init.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbHost = configService.get<string>('DB_HOST', 'localhost');
        const sslCaPath = configService.get<string>('DB_SSL_CA_PATH');
        const isDockerEnvironment =
          existsSync('/.dockerenv') ||
          configService.get<string>('NODE_ENV') === 'production';
        const host =
          isDockerEnvironment && dbHost === 'localhost'
            ? 'host.docker.internal'
            : dbHost;

        const extra: Record<string, unknown> = {};
        if (sslCaPath && existsSync(sslCaPath)) {
          extra.ssl = {
            rejectUnauthorized: true,
            ca: readFileSync(sslCaPath).toString(),
          };
        }

        return {
          type: 'mysql' as const,
          host,
          port: Number(configService.get<string>('DB_PORT', '3306')),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
          logging: configService.get<string>('DB_LOGGING') === 'true',
          autoLoadEntities: true,
          ...extra,
        };
      },
    }),
    UsersModule,
  ],
  providers: [DatabaseInitService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
