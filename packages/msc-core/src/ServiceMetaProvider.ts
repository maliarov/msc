import { getArgsNames } from './util/function';
import { Map } from './Map';
import {
  ServiceMetaInfo,
  ServiceMethodMetaInfo,
  ServiceMethodArgumentSource,
} from './Service';

export class BaseServiceMetaInfoProvider implements ServiceMetaInfo {
  public methods: Map<ServiceMethodMetaInfo>;

  constructor(public name: string, public instance: any) {
    this.methods = this.scanForMethods(instance);
  }

  scanForMethods(serviceInstance: any): Map<ServiceMethodMetaInfo> {
    const servicePrototype = serviceInstance.constructor.prototype;

    return Object
      .getOwnPropertyNames(servicePrototype)
      .reduce(
        (methods: Map<ServiceMethodMetaInfo>, propertyName) => {
          const property = Object.getOwnPropertyDescriptor(servicePrototype, propertyName);
          if (propertyName !== 'constructor' && property && typeof property.value === 'function') {
            methods[propertyName] = this.onMapMethod(propertyName, property.value);
          }
          return methods;
        },
        {},
      );
  }

  onMapMethod(methodName: string, methodInstance: Function): ServiceMethodMetaInfo {
    return {
      name: methodName,
      instance: methodInstance,
      args: getArgsNames(methodInstance).map(argName => ({
        name: argName,
        source: argName.startsWith('$')
          ? ServiceMethodArgumentSource.inject
          : ServiceMethodArgumentSource.input,
      })),
    };
  }
}
