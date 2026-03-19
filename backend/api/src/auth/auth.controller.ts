import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@Controller('auth')
export class AuthController {
    /**
   * GET /auth/me
   * Any authenticated user can access this — no role restriction.
   */
    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Req() req: any) {
        return {
        message: 'Authenticated successfully',
        user: req.user,
        };
    }

    /**
   * GET /auth/platform_reviewer
   * Only reviewers and admins can access this route.
   */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.REVIEWER, Role.ADMIN)
    @Get('platform_reviewer')
    getReviewerRoute(@Req() req: any) {
        return {
        message: 'Reviewer route accessed',
        user: req.user,
        };
    }

    /**
   * GET /auth/admin
   * Only admins can access this route.
   */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get('admin')
    getAdminRoute(@Req() req: any) {
        return {
        message: 'Admin route accessed',
        user: req.user,
        };
    }
}
