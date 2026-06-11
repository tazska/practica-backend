import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class DatabaseInitService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async onModuleInit(): Promise<void> {
    const adminUsername = this.configService.get<string>('ADMIN_USERNAME');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!adminUsername || !adminPassword) {
      return;
    }

    try {
      const existingAdmin =
        await this.usersService.findByUsername(adminUsername);

      if (existingAdmin) {
        return;
      }

      await this.usersService.createUser({
        username: adminUsername,
        password: adminPassword,
        isAdmin: true,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : String(error);

      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'ER_NO_SUCH_TABLE'
      ) {
        return;
      }

      console.error('Error initializing admin user:', message);
    }
  }
}
