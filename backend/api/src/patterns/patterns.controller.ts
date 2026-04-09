import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PatternsService, PatternsResponse } from './patterns.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

interface AuthenticatedRequest {
  user: { id: string };
}

@Controller('patterns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
export class PatternsController {
  constructor(private readonly patternsService: PatternsService) {}

  /**
   * GET /patterns
   * Returns aggregated experience stats for the authenticated user.
   */
  @Get()
  getPatterns(@Req() req: AuthenticatedRequest): Promise<PatternsResponse> {
    return this.patternsService.getPatterns(req.user.id);
  }

  /**
   * GET /patterns/ai-reflection
   * Returns an AI-generated monthly insight for the authenticated user.
   */
  @Get('ai-reflection')
  getMonthlyInsight(@Req() req: AuthenticatedRequest,): Promise<{ enabled: boolean; insight: string | null }> {
    return this.patternsService.getMonthlyInsight(req.user.id);
  }
}
