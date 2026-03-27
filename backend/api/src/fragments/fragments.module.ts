import { Module } from '@nestjs/common';
import { FragmentsController } from './fragments.controller';
import { FragmentsService } from './fragments.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';
import { memoryStorage } from 'multer';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    SupabaseModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
    AuthModule,
  ],
  controllers: [FragmentsController],
  providers: [FragmentsService],
  exports: [FragmentsService],
})
export class FragmentsModule {}
