export class CreateSocialAccountDto {
  platform: string;
  pageName: string;
  pageId: string;
  accessToken: string;
  apiUrl?: string;
}

export class UpdateSocialAccountDto {
  platform?: string;
  pageName?: string;
  pageId?: string;
  accessToken?: string;
  apiUrl?: string;
  status?: string;
}
