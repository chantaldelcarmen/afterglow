import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';

type DemoAccount = {
  email: string;
  password: string;
  role: 'user' | 'platform_reviewer' | 'admin';
  displayName: string;
};

type DemoExperience = {
  title: string;
  description: string;
  location: string;
  experienceDate: string;
  emotionTags: string[];
  reflection: string;
};

type DemoResetResult = {
  message: string;
  seededExperiences: number;
};

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'user@afterglow.dev',
    password: 'Afterglow1234!',
    role: 'user',
    displayName: 'Demo User',
  },
  {
    email: 'user2@afterglow.dev',
    password: 'Afterglow1234!',
    role: 'user',
    displayName: 'Demo User 2',
  },
  {
    email: 'reviewer@afterglow.dev',
    password: 'Afterglow1234!',
    role: 'platform_reviewer',
    displayName: 'Demo Reviewer',
  },
  {
    email: 'admin@afterglow.dev',
    password: 'Afterglow1234!',
    role: 'admin',
    displayName: 'Demo Admin',
  },
];

const DEMO_EXPERIENCES: DemoExperience[] = [
  {
    title: 'Sunrise Walk in Nose Hill',
    description:
      'Watched the city light up during a cold sunrise walk and felt unexpectedly calm.',
    location: 'Calgary, AB',
    experienceDate: '2026-01-17',
    emotionTags: ['calm', 'hopeful', 'grateful'],
    reflection:
      'Starting the day outside helped me reset and made everything else feel more manageable.',
  },
  {
    title: 'Family Dinner at Home',
    description:
      'Cooked together, shared stories, and laughed for hours around the kitchen table.',
    location: 'Calgary, AB',
    experienceDate: '2026-02-09',
    emotionTags: ['connected', 'joyful', 'grounded'],
    reflection:
      'Simple evenings are still the moments I remember most.',
  },
  {
    title: 'Weekend Drive to Banff',
    description:
      'Took a spontaneous drive to Banff and spent the afternoon by the river trail.',
    location: 'Banff, AB',
    experienceDate: '2026-03-02',
    emotionTags: ['free', 'curious', 'relieved'],
    reflection:
      'Changing scenery for a day made my week feel lighter and less repetitive.',
  },
];

@Injectable()
export class DemoService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  async resetAndReseed(triggeredBy: string): Promise<DemoResetResult> {
    this.assertResetEnabled();

    const supabase = this.supabaseService.getClient();

    const demoUserIds = await this.ensureDemoAccounts();

    await this.clearDomainData();

    await this.clearStorageBucket();

    const seededExperiences = await this.seedDemoExperiences(
      demoUserIds['user@afterglow.dev'],
    );

    return {
      message: `Demo data reset and reseeded by ${triggeredBy}.`,
      seededExperiences,
    };
  }

  private assertResetEnabled(): void {
    const env = this.configService.get<string>('NODE_ENV') ?? 'development';
    const enabledFlag = this.configService.get<string>('DEMO_RESET_ENABLED');

    const isExplicitlyEnabled = enabledFlag?.toLowerCase() === 'true';
    const isDevelopment = env !== 'production';

    if (!isExplicitlyEnabled && !isDevelopment) {
      throw new ForbiddenException(
        'Demo reset is disabled in production unless DEMO_RESET_ENABLED=true.',
      );
    }
  }

  private async ensureDemoAccounts(): Promise<Record<string, string>> {
    const supabase = this.supabaseService.getClient();
    const { data: listed, error: listError } =
      await supabase.auth.admin.listUsers();

    if (listError) {
      throw new InternalServerErrorException(listError.message);
    }

    const result: Record<string, string> = {};

    for (const account of DEMO_ACCOUNTS) {
      const existing = listed.users.find((user) => user.email === account.email);

      let userId = existing?.id;
      if (!userId) {
        const { data: created, error: createError } =
          await supabase.auth.admin.createUser({
            email: account.email,
            password: account.password,
            email_confirm: true,
          });

        if (createError || !created.user) {
          throw new InternalServerErrorException(
            createError?.message ?? `Failed creating ${account.email}`,
          );
        }

        userId = created.user.id;
      }

      result[account.email] = userId;

      const now = new Date().toISOString();
      const { error: upsertProfileError } = await supabase.from('profiles').upsert(
        {
          id: userId,
          role: account.role,
          display_name: account.displayName,
          created_at: now,
          updated_at: now,
        },
        { onConflict: 'id' },
      );

      if (upsertProfileError) {
        throw new InternalServerErrorException(upsertProfileError.message);
      }
    }

    return result;
  }

  private async clearDomainData(): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error: clearFlagsError } = await supabase
      .from('system_flags')
      .delete()
      .gt('id', 0);
    if (clearFlagsError) {
      throw new InternalServerErrorException(clearFlagsError.message);
    }

    const { error: clearAnchorError } = await supabase
      .from('experiences')
      .update({ is_draft: true, anchor_fragment_id: null })
      .gte('created_at', '2000-01-01');
    if (clearAnchorError) {
      throw new InternalServerErrorException(clearAnchorError.message);
    }

    const { error: clearReflectionsError } = await supabase
      .from('reflections')
      .delete()
      .gte('created_at', '2000-01-01');
    if (clearReflectionsError) {
      throw new InternalServerErrorException(clearReflectionsError.message);
    }

    const { error: clearFragmentsError } = await supabase
      .from('fragments')
      .delete()
      .gte('created_at', '2000-01-01');
    if (clearFragmentsError) {
      throw new InternalServerErrorException(clearFragmentsError.message);
    }

    const { error: clearExperiencesError } = await supabase
      .from('experiences')
      .delete()
      .gte('created_at', '2000-01-01');
    if (clearExperiencesError) {
      throw new InternalServerErrorException(clearExperiencesError.message);
    }
  }

  private async clearStorageBucket(): Promise<void> {
    const supabase = this.supabaseService.getClient();
    const { data: topLevel, error: listError } = await supabase.storage
      .from('fragments')
      .list('', { limit: 1000 });

    if (listError) {
      throw new InternalServerErrorException(listError.message);
    }

    const pathsToDelete: string[] = [];

    for (const folder of topLevel) {
      const { data: files, error: subListError } = await supabase.storage
        .from('fragments')
        .list(folder.name, { limit: 1000 });

      if (subListError) {
        throw new InternalServerErrorException(subListError.message);
      }

      for (const file of files) {
        pathsToDelete.push(`${folder.name}/${file.name}`);
      }
    }

    if (pathsToDelete.length === 0) {
      return;
    }

    const { error: removeError } = await supabase.storage
      .from('fragments')
      .remove(pathsToDelete);

    if (removeError) {
      throw new InternalServerErrorException(removeError.message);
    }
  }

  private async seedDemoExperiences(userId: string): Promise<number> {
    const supabase = this.supabaseService.getClient();
    let seeded = 0;

    for (const exp of DEMO_EXPERIENCES) {
      const { data: created, error: createError } = await supabase
        .from('experiences')
        .insert({
          user_id: userId,
          title: exp.title,
          description: exp.description,
          location: exp.location,
          experience_date: exp.experienceDate,
          emotion_tags: exp.emotionTags,
          is_draft: true,
        })
        .select('id')
        .single<{ id: string }>();

      if (createError || !created) {
        throw new InternalServerErrorException(
          createError?.message ?? `Failed to seed ${exp.title}`,
        );
      }

      const { error: fragmentError } = await supabase.from('fragments').insert({
        experience_id: created.id,
        type: 'text',
        caption: 'Demo note',
        text_context: exp.description,
      });

      if (fragmentError) {
        throw new InternalServerErrorException(fragmentError.message);
      }

      const { error: reflectionError } = await supabase.from('reflections').insert({
        experience_id: created.id,
        user_id: userId,
        reflection_text: exp.reflection,
      });

      if (reflectionError) {
        throw new InternalServerErrorException(reflectionError.message);
      }

      seeded += 1;
    }

    return seeded;
  }
}
