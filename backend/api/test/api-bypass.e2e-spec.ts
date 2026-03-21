import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') }); 

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { App } from 'supertest/types';
import request from 'supertest';
import { createClient } from '@supabase/supabase-js';
import { SupabaseService } from '../src/supabase/supabase.service';

// testing direct api bypass
describe('API Bypass', () => {
    let app: INestApplication<App>;
    let adminToken: string;
    let platformReviewerToken: string;
    let userToken: string;

    beforeAll(async () => {
        try {  
            const supabase = createClient(
                process.env.SUPABASE_URL!,
                process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
            );

            const moduleFixture: TestingModule = await Test.createTestingModule({
                imports: [AppModule],
            })
            .overrideProvider(SupabaseService)
            .useValue({ getClient: () => supabase })
            .compile();

            app = moduleFixture.createNestApplication();
            await app.init();

            // get tokens for user, platform reviewer and admin by logging in
            const { data : admin, error: adminError } = await supabase.auth.signInWithPassword({
                email: 'admin@afterglow.dev',
                password: 'Afterglow1234!'
            });
            adminToken = admin.session!.access_token;

            const { data: reviewer, error: reviewerError } = await supabase.auth.signInWithPassword({
                email: 'reviewer@afterglow.dev',
                password: 'Afterglow1234!'
            });
            platformReviewerToken = reviewer.session!.access_token;

            const { data: user, error: userError } = await supabase.auth.signInWithPassword({
                email: 'user@afterglow.dev',
                password: 'Afterglow1234!'
            });
            userToken = user.session!.access_token;


        } catch (err) {
            throw err; 
        }
    });

    afterAll(async() => {
        if (app) await app.close()
    });


    // users without a token cannot access user/platform reviewer or admin routes
    it('non-authorized user cannot access any route (no token)', async() => {
        await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401)

        await request(app.getHttpServer())
        .get('/auth/admin')
        .expect(401)
    });


    // no admin token to access admin routes
    it('non-admin cant access admin protected routes', async() => {
        await Promise.all([
            request(app.getHttpServer())
            .get('/auth/admin')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(403),

            request(app.getHttpServer())
            .get('/auth/admin')
            .set('Authorization', `Bearer ${platformReviewerToken}`)
            .expect(403),
        ]);
    });


    // admin can access admin only routes
    it('admin can access admin routes', async() => {
        await request(app.getHttpServer())
            .get('/auth/admin')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);
    });


    // platform reviewer routes that admins can also access
    it('admins and reviewers can access', async() => {
        await Promise.all([
            request(app.getHttpServer())
            .get('/auth/platform_reviewer')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200),

            request(app.getHttpServer())
            .get('/auth/platform_reviewer')
            .set('Authorization', `Bearer ${platformReviewerToken}`)
            .expect(200),
        ]);
    });


    // self promoting is not allowed
    it('user cannot self promote to admin role', async() => {
        await request(app.getHttpServer())
        .post('/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({role: 'admin'})
        .expect(403)
    })


    // invalid tokens used
    it('random tokens used for authorization', async() => {
        await Promise.all([
            request(app.getHttpServer())
            .get('/auth/me')
            .set('Authorization', 'Bearer randomToken')
            .expect(401),

            request(app.getHttpServer())
            .get('/auth/platform_reviewer')
            .set('Authorization', 'Bearer randomToken')
            .expect(401),

            request(app.getHttpServer())
            .get('/auth/admin')
            .set('Authorization', 'Bearer randomToken')
            .expect(401),

            request(app.getHttpServer())
            .get('/auth/me')
            .set('Authorization', 'Bearer ')
            .expect(401),
        ]);
    });
});