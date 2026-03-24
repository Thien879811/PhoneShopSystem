export class CreatePostDto {
  title: string;
  content: string;
  scheduledTime?: string;
  platformIds?: number[];
  images?: string[];
}

export class UpdatePostDto {
  title?: string;
  content?: string;
  scheduledTime?: string;
  status?: string;
  platformIds?: number[];
  images?: string[];
}
