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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExperiencesService } from './experiences.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';

@Controller('experiences')
@UseGuards(JwtAuthGuard)
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  /**
   * POST /experiences
   * Create a new experience for the authenticated user.
   */
  @Post()
  create(@Req() req: any, @Body() dto: CreateExperienceDto) {
    return this.experiencesService.create(req.user.id, dto);
  }

  /**
   * GET /experiences
   * Get all experiences belonging to the authenticated user.
   */
  @Get()
  findAll(@Req() req: any) {
    return this.experiencesService.findAll(req.user.id);
  }

  /**
   * GET /experiences/:id
   * Get a single experience by ID belonging to the authenticated user.
   */
  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.experiencesService.findOne(req.user.id, id);
  }

  /**
   * PATCH /experiences/:id
   * Update an experience belonging to the authenticated user.
   */
  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    return this.experiencesService.update(req.user.id, id, dto);
  }

  /**
   * DELETE /experiences/:id
   * Delete an experience belonging to the authenticated user.
   */
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.experiencesService.remove(req.user.id, id);
  }
}
