import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [SupabaseModule],
  controllers: [AuthController],
  providers: [JwtAuthGuard]
})
export class AuthModule {}
