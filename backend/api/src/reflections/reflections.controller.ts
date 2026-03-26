import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ReflectionsService } from './reflections.service';
import type { ReflectionRow } from './reflections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReflectionDto } from './dto/create-reflection.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('experiences/:id/reflections')
@UseGuards(JwtAuthGuard)
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
    @Req() req: AuthenticatedRequest,
  ): Promise<ReflectionRow> {
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
    @Req() req: AuthenticatedRequest,
  ): Promise<ReflectionRow[]> {
    return this.reflectionsService.getReflectionsForExperience(
      experienceId,
      req.user.id,
    );
  }

  /**
   * PATCH /experiences/:id/reflections/:reflectionId
   * Edit a reflection (owner only).
   */
  @Patch(':reflectionId')
  async updateReflection(
    @Param('id') experienceId: string,
    @Param('reflectionId') reflectionId: string,
    @Body() dto: CreateReflectionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ReflectionRow> {
    return this.reflectionsService.updateReflection(
      reflectionId,
      req.user.id,
      dto,
    );
  }

  /**
   * DELETE /experiences/:id/reflections/:reflectionId
   * Delete a reflection (owner only).
   */
  @Delete(':reflectionId')
  async deleteReflection(
    @Param('id') experienceId: string,
    @Param('reflectionId') reflectionId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    return this.reflectionsService.deleteReflection(reflectionId, req.user.id);
  }
}
