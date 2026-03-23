import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { App } from 'supertest/types';
import request from 'supertest';
import { SupabaseService } from '../src/supabase/supabase.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { Role } from '../src/enums/role.enum';

// testing direct api bypass
describe('Authentication and Authorization API Bypass', () => {
  let app: INestApplication<App>;
  // mock jwt tokens for the 3 roles
  const adminToken = 'admin-token';
  const reviewerToken = 'reviewer-token';
  const userToken = 'user-token';

  beforeAll(async () => {
    const supabase = {
      getClient: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SupabaseService)
      .useValue(supabase)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          // mock jwt authorization guard
          const request = context.switchToHttp().getRequest();
          const authHeader = request.headers.authorization as
            | string
            | undefined;

          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException();
          }

          const token = authHeader.replace('Bearer ', '').trim();
          if (!token) throw new UnauthorizedException();

          if (token == 'admin-token') {
            request.user = { role: Role.ADMIN };
          } else if (token == 'reviewer-token') {
            request.user = { role: Role.REVIEWER };
          } else if (token == 'user-token') {
            request.user = { role: Role.USER };
          } else throw new UnauthorizedException();

          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  // users without a token cannot access user/platform reviewer or admin routes
  it('non-authorized user cannot access any route (no token)', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);

    await request(app.getHttpServer()).get('/auth/admin').expect(401);
  });

  // no admin token to access admin routes
  it('non-admin cant access admin protected routes', async () => {
    await Promise.all([
      request(app.getHttpServer())
        .get('/auth/admin')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403),

      request(app.getHttpServer())
        .get('/auth/admin')
        .set('Authorization', `Bearer ${reviewerToken}`)
        .expect(403),
    ]);
  });

  // admin can access admin only routes
  it('admin can access admin routes', async () => {
    await request(app.getHttpServer())
      .get('/auth/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  // platform reviewer routes that admins can also access
  it('admins and reviewers can access', async () => {
    await Promise.all([
      request(app.getHttpServer())
        .get('/auth/platform_reviewer')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200),

      request(app.getHttpServer())
        .get('/auth/platform_reviewer')
        .set('Authorization', `Bearer ${reviewerToken}`)
        .expect(200),

      request(app.getHttpServer())
        .get('/auth/platform_reviewer')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403),
    ]);
  });

  // self promoting is not allowed - add later
  /*
   it('user cannot self promote to admin role', async() => {
       await request(app.getHttpServer())
        .post('/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: Role.ADMIN })
        .expect(403)
    })
    */

  // invalid tokens used
  it('random tokens used for authorization', async () => {
    await Promise.all([
      request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer randomToken')
        .expect(401),

      request(app.getHttpServer())
        .get('/auth/platform_reviewer')
        .set('Authorization', 'Bearer askdnaksdj')
        .expect(401),

      request(app.getHttpServer())
        .get('/auth/admin')
        .set('Authorization', 'Bearer oignjpanckn')
        .expect(401),

      request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer ')
        .expect(401),
    ]);
  });

  // random header will not return
  it('malformed headers should return 401', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('auth', `Bearer ${userToken}`)
      .expect(401);
  });

  // authorization header is default to lower case (not case sensitive)
  it('case insensitive headers should work', async () => {
    await Promise.all([
      request(app.getHttpServer())
        .get('/auth/me')
        .set('AUTHORIZATION', `Bearer ${userToken}`)
        .expect(200),

      request(app.getHttpServer())
        .get('/auth/platform_reviewer')
        .set('authorization', `Bearer ${reviewerToken}`)
        .expect(200),
    ]);
  });

  // should return 401 for no 'Bearer', incorrect schemes
  it('incorrect schemes', async () => {
    await Promise.all([
      // incorrect scheme
      request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Token ${userToken}`)
        .expect(401),

      // case sensitive bearer
      request(app.getHttpServer())
        .get('/auth/platform_reviewer')
        .set('Authorization', `bearer ${reviewerToken}`)
        .expect(401),

      // no Bearer prefix - only token
      request(app.getHttpServer())
        .get('/auth/platform_reviewer')
        .set('Authorization', `${reviewerToken}`)
        .expect(401),
    ]);
  });
});
