import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReflectionsService } from './reflections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReflectionDto } from './dto/create-reflection.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('experiences/:id/reflections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReflectionsController {
  constructor(private readonly reflectionsService: ReflectionsService) {}

  /**
   * POST /experiences/:id/reflections
   * Create a new reflection for an experience.
   */
  @Post()
  async createReflection(
    @Param('id') experienceId: string,
    @Body() dto: CreateReflectionDto,
    @Req() req: any,
  ) {
    return this.reflectionsService.createReflection(
      experienceId,
      req.user.id,
      dto,
    );
  }

  /**
   * GET /experiences/:id/reflections
   * Retrieve all reflections for an experience.
   */
  @Get()
  async getReflections(
    @Param('id') experienceId: string,
    @Req() req: any,
  ) {
    return this.reflectionsService.getReflectionsForExperience(
      experienceId,
      req.user.id,
    );
  }
  
}