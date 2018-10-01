import { Map } from './Map';

export interface Context {
  path: string;
  args?: Map<any>;
  value?: any;
}
