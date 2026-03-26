import { Module } from '@nestjs/common';
import { ReflectionsController } from './reflections.controller';
import { ReflectionsService } from './reflections.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ReflectionsController],
  providers: [ReflectionsService],
})
export class ReflectionsModule {}
