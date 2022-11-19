declare module "lint-staged" {
  type Task =
    | string
    | ((filenames: string[]) => string | string[] | Promise<string | string[]>);
  interface Options {
    allowEmpty?: boolean;
    concurrent?: boolean;
    config?: Record<string, Task | Task[]>;
    configPath?: string;
    cwd?: string;
    debug?: boolean;
    maxArgLength?: number | null;
    quiet?: boolean;
    relative?: boolean;
    shell?: boolean;
    stash?: boolean;
    verbose?: boolean;
  }
  export default function lintStaged(options?: Options): Promise<boolean>;
}
