import { GitOpsConfig } from './config';
import { BaseGitOpsConfig } from './base';
export declare class KustomizeOption {
    baseImage: string;
    directory: string;
}
export declare class KustomizeGitOpsConfig extends BaseGitOpsConfig {
    using: 'kustomize';
    kustomize: KustomizeOption;
}
export declare function isKustomtizeGitOpsConfig(config: GitOpsConfig): config is KustomizeGitOpsConfig;
