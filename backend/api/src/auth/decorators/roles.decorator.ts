import { SetMetadata } from '@nestjs/common';
import { Role } from '../../enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Attach one or more required roles to a route handler or controller.
 *
 * @example
 * @Roles(Role.ADMIN)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Get('users')
 * getUsers() { ... }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
