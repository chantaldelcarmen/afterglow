import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';

@Module({
  imports: [AuthModule, SupabaseModule],
  controllers: [DemoController],
  providers: [DemoService],
})
export class DemoModule {}
