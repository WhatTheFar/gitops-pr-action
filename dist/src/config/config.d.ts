import { ValidationError } from 'class-validator';
import { KustomizeGitOpsConfig } from './kustomize';
export declare type GitOpsConfig = KustomizeGitOpsConfig;
export declare type ValidationErr = {
    error: 'ValidationError';
    validationErrors: ValidationError[];
};
export declare type InvalidConfigErr = {
    error: 'InvalidConfigError';
};
export declare type GitOpsConfigReturn = {
    config: GitOpsConfig;
} | ValidationErr | InvalidConfigErr;
export declare function gitOpsConfigFor(filePath: string): GitOpsConfigReturn;
export declare function gitOpsConfigFormText(text: string): GitOpsConfigReturn;
