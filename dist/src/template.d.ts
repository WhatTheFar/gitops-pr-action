import { GitOpsConfig } from './config';
export declare function renderConfig(filePath: string, version: string, vars: Record<string, unknown>): Promise<string>;
export declare function setImageFor(config: GitOpsConfig, configPath: string, image: string): Promise<string[]>;
export declare function setKustomizeImage(kustomizeDir: string, baseImage: string, newImage: string): Promise<string[]>;
