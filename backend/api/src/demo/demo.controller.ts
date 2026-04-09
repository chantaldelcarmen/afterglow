import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../enums/role.enum';
import { DemoService } from './demo.service';

@Controller('demo')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Post('reset')
  resetDemoData(@Req() req: { user: { email?: string } }) {
    return this.demoService.resetAndReseed(req.user.email ?? 'admin');
  }
}
