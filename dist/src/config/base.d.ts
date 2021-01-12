export declare class PullRequestReviewer {
    users?: string[];
    teams?: string[];
}
export declare class PullRequestOption {
    title: string;
    branch: string;
    baseBranch: string;
    reviewers?: PullRequestReviewer;
    assignees?: string[];
}
export declare class GitUserOption {
    name: string;
    email: string;
}
export declare class BaseGitOpsConfig {
    using: string;
    commitMessage: string;
    pullRequest: PullRequestOption;
    gitUser: GitUserOption;
}
