import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Req() req: any) {
        return {
        message: 'Authenticated successfully',
        user: req.user,
        };
    }
}
