export class CreatePostDto {
  title: string;
  content: string;
  scheduledTime?: string;
  platformIds?: number[];
  images?: string[];
  isRepeated?: boolean;
  repeatInterval?: number;
}

export class UpdatePostDto {
  title?: string;
  content?: string;
  scheduledTime?: string;
  status?: string;
  platformIds?: number[];
  images?: string[];
  isRepeated?: boolean;
  repeatInterval?: number;
}
