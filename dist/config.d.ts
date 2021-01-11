export interface GitOpsConfig {
    using: 'kustomize';
    commitMessage: string;
    pullRequest: {
        title: string;
        branch: string;
        baseBranch: string;
        reviewers?: {
            users?: string[];
            teams?: string[];
        };
        assignees?: string[];
    };
    gitUser: {
        name: string;
        email: string;
    };
    [key: string]: unknown;
}
export interface KustomizeGitOpsConfig extends GitOpsConfig {
    kustomize: KustomizeConfig;
}
export interface KustomizeConfig {
    baseImage: string;
    directory: string;
}
export declare function gitOpsConfigFor(filePath: string): GitOpsConfig;
export declare function gitOpsConfigFormText(text: string): GitOpsConfig;
export declare function isKustomtizeGitOpsConfig(config: GitOpsConfig): config is KustomizeGitOpsConfig;
