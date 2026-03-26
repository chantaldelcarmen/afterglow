import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { FragmentsService } from './fragments.service';
import { AttachFragmentDto } from './dto/attach-fragment.dto';

@Controller('experiences')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
export class FragmentsController {
  constructor(private fragmentsService: FragmentsService) {}
  /*
   POST /experiences/:id/fragments
   User can attach/upload a fragment to an experience
   */
  @Post(':id/fragments')
  @UseInterceptors(FileInterceptor('file'))
  attachFragment(
    @Req() req,
    @Param('id') experienceId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: AttachFragmentDto,
  ) {
    return this.fragmentsService.attachFragment(
      req.user.id,
      experienceId,
      file,
      dto,
    );
  }

  /*
   GET /experiences/:id/fragments
   List all the fragments attached to a user's experience
   */
  @Get(':id/fragments')
  getFragmentsList(@Req() req, @Param('id') experienceId: string) {
    return this.fragmentsService.getFragmentsList(req.user.id, experienceId);
  }

  /*
   DELETE /experiences/:id/fragments/:fragmentId
   Remove a fragment from a user's experience
   */
  @Delete(':id/fragments/:fragmentId')
  removeFragment(
    @Req() req,
    @Param('id') experienceId: string,
    @Param('fragmentId') fragmentId: string,
  ) {
    return this.fragmentsService.removeFragment(
      req.user.id,
      experienceId,
      fragmentId,
    );
  }

  /*
   PATCH /experiences/:id/fragments/:fragmentId/anchor 
   Choose a fragment to set as the anchor for a user's experience
   */
  @Patch(':id/fragments/:fragmentId/anchor')
  setAnchorFragment(
    @Req() req,
    @Param('id') experienceId: string,
    @Param('fragmentId') fragmentId: string,
  ) {
    return this.fragmentsService.setAnchorFragment(
      req.user.id,
      experienceId,
      fragmentId,
    );
  }
}
