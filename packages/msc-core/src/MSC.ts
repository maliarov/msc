import { Map } from './Map';
import { ServiceMethodArgumentSource } from './Service';
import { BaseServiceMetaInfoProvider } from './ServiceMetaProvider';
import { MiddlewareHandler } from './Middleware';
import { Context } from './Context';

export class MSC {
  private middlewaresHandlers: MiddlewareHandler[];

  constructor() {
    this.middlewaresHandlers = [];
  }

  use(midlewareHandler: MiddlewareHandler) {
    this.middlewaresHandlers.push(midlewareHandler);
    return this;
  }

  host(serviceName: string, serviceInstance: any) {
    const serviceMetaInfo = new BaseServiceMetaInfoProvider(serviceName, serviceInstance);

    this.use(async (context: Context) => {
      if (!context.path.startsWith(`${serviceName}.`)) {
        return;
      }

      const [, methodName] = context.path.split('.');
      const serviceMethodMetaInfo = serviceMetaInfo.methods[methodName];
      const contextArgs = context.args || {};
      const args = serviceMethodMetaInfo.args.map((serviceMethodArgumentMetaInfo) => {
        switch (serviceMethodArgumentMetaInfo.source) {
          case ServiceMethodArgumentSource.inject:
            return (<any>context)[serviceMethodArgumentMetaInfo.name.slice(1)];

          case ServiceMethodArgumentSource.input:
            return contextArgs[serviceMethodArgumentMetaInfo.name];
          // const value = contextArgs[serviceMethodArgumentMetaInfo.name];
          // return typeof value === undefined
          //    ? serviceMethodArgumentMetaInfo.defaultValue
          //    : value;
        }

        return undefined;
      });

      return await Promise.resolve(
        serviceMethodMetaInfo.instance.call(serviceMetaInfo.instance, ...args)
      );
    });

    return this;
  }

  async invoke(path: string, args: Map<any>): Promise<any> {
    const context = {
      path,
      args,
      value: undefined,
    };

    for (const middlewareHandler of this.middlewaresHandlers) {
      context.value = await middlewareHandler(context) || context.value;
    }

    return context.value;
  }

}
