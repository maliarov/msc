import { Map } from './Map';

export enum ServiceMethodArgumentSource {
  input,
  inject,
}

export interface ServiceMethodArgumentMetaInfo {
  name: string;
  source: ServiceMethodArgumentSource;
  // validate?: (value: any) => boolean;
}

export interface ServiceMethodResultMetaInfo {

}

export interface ServiceMethodMetaInfo {
  name: string;
  instance: Function;
  args: ServiceMethodArgumentMetaInfo[];
  result?: ServiceMethodResultMetaInfo;
}

export interface ServiceMetaInfo {
  name: string;
  instance: any;
  methods: Map<ServiceMethodMetaInfo>;
}
