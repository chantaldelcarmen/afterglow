export class CreateExperienceDto {
  title: string;
  description?: string;
  location?: string;
  experience_date?: string;
  start_date?: string;
  end_date?: string;
  is_draft?: boolean;
}
