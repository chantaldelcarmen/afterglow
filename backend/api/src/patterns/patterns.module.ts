import { Module } from '@nestjs/common';
import { PatternsController } from './patterns.controller';
import { PatternsService } from './patterns.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [PatternsController],
  providers: [PatternsService],
})
export class PatternsModule {}
