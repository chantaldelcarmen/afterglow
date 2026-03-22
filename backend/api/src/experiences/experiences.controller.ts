import { Controller, Get, Post, Delete, Patch, Req, UseGuards, UseInterceptors, UploadedFile, Param, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExperiencesService } from './experiences.service';

@Controller('experiences')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
export class ExperiencesController {
   constructor(private experiencesService: ExperiencesService) {}
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
    ) {
        return this.experiencesService.attachFragment(req.user.id, experienceId, file);
   }


   /*
   GET /experiences/:id/fragments
   List all the fragments attached to a user's experience
   */
   @Get(':id/fragments')
   getFragmentsList(
        @Param('id') experienceId: string,
   ) {
        this.experiencesService.getFragmentsList(experienceId);
   }


   /*
   DELETE /experiences/:id/fragments/:fragmentId
   Remove a fragment from a user's experience
   */
   @Delete(':id/fragments/:fragmentId')
   removeFragment(
        @Param('id') experienceId: string,
        @Param('fragmentId') fragmentId: string,
   ) {
        this.experiencesService.removeFragment(experienceId, fragmentId);
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
        this.experiencesService.setAnchorFragment(req.user.id, experienceId, fragmentId);
   }
}