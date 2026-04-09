import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { FragmentsModule } from './fragments/fragments.module';
import { ExperiencesModule } from './experiences/experiences.module';
import { PatternsModule } from './patterns/patterns.module';
import { ReflectionsModule } from './reflections/reflections.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    AuthModule,
    FragmentsModule,
    ExperiencesModule,
    PatternsModule,
    ReflectionsModule,
    SettingsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
