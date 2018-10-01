import { Context } from './Context';

export type MiddlewareHandler = (context: Context) => Promise<any>;
