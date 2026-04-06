import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PatternsService, PatternsResponse } from './patterns.service';

interface AuthenticatedRequest {
  user: { id: string };
}

@Controller('patterns')
@UseGuards(JwtAuthGuard)
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
}
