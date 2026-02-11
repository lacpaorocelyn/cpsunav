import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { BuildingsModule } from './buildings/buildings.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || process.env.MYSQLHOST,
      port: parseInt(
        process.env.DB_PORT || process.env.MYSQLPORT || '3306',
        10,
      ),
      username: process.env.DB_USERNAME || process.env.MYSQLUSER,
      password:
        process.env.DB_PASSWORD ||
        process.env.MYSQLPASSWORD ||
        process.env.MYSQL_ROOT_PASSWORD,
      database: process.env.DB_DATABASE || process.env.MYSQLDATABASE,
      autoLoadEntities: true,
      synchronize: true, // Be careful with this in production
    }),
    UsersModule,
    AuthModule,
    BuildingsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
