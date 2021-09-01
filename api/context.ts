export interface ApiContext {
  userId: string;
  userLevel: number;
}

export type ApiFunction = (ctx: ApiContext, ...args: any) => unknown | Promise<unknown>;


