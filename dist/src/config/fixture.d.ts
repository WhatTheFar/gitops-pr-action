import { BaseGitOpsConfig } from './base';
import { KustomizeGitOpsConfig, KustomizeOption } from './kustomize';
export declare function getFixtureFile(relPathUnderFixture: string): string;
export declare const baseConfig: BaseGitOpsConfig;
export declare const kustomizeOption: KustomizeOption;
export declare const kustomizeConfig: KustomizeGitOpsConfig;
