import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class PullRequestReviewer {
  @IsOptional()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  users?: string[];

  @IsOptional()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @ArrayNotEmpty()
  teams?: string[];
}

export class PullRequestOption {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  branch!: string;

  @IsString()
  @MinLength(1)
  baseBranch!: string;

  @Type(() => PullRequestReviewer)
  @IsOptional()
  @ValidateNested()
  reviewers?: PullRequestReviewer;

  @IsOptional()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @ArrayNotEmpty()
  assignees?: string[];
}

export class GitUserOption {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEmail()
  email!: string;
}

export class BaseGitOpsConfig {
  @IsString()
  @MinLength(1)
  using!: string;

  @IsString()
  @MinLength(1)
  commitMessage!: string;

  @Type(() => PullRequestOption)
  @ValidateNested()
  pullRequest!: PullRequestOption;

  @Type(() => GitUserOption)
  @ValidateNested()
  gitUser!: GitUserOption;
}
