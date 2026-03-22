import { Module } from '@nestjs/common';
import { ExperiencesController } from './experiences.controller';
import { ExperiencesService } from './experiences.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { memoryStorage } from 'multer';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    SupabaseModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [ExperiencesController],
  providers: [JwtAuthGuard, RolesGuard, ExperiencesService],
  exports: [JwtAuthGuard, RolesGuard]
})
export class ExperiencesModule {}
