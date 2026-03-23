import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
<<<<<<< HEAD
import { FragmentsModule } from './fragments/fragments.module';
=======
import { ExperiencesModule } from './experiences/experiences.module';
>>>>>>> 680a8f5 (feat: add Experience CRUD API endpoints)

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    AuthModule,
<<<<<<< HEAD
    FragmentsModule,
=======
    ExperiencesModule,
>>>>>>> 680a8f5 (feat: add Experience CRUD API endpoints)
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
