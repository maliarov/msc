import { ServiceMethodArgumentSource } from './Service';
import { BaseServiceMetaInfoProvider } from './ServiceMetaProvider';
import { MiddlewareHandler } from './Middleware';
import { Context } from './Context';

export class MSC {
  private middlewaresHandlers: MiddlewareHandler[];

  constructor() {
    this.middlewaresHandlers = [];
  }

  use(midlewareHandler: MiddlewareHandler): MSC {
    this.middlewaresHandlers.push(midlewareHandler);
    return this;
  }

  host(serviceName: string, serviceInstance: any): MSC {
    const serviceMetaInfo = new BaseServiceMetaInfoProvider(serviceName, serviceInstance);

    this.use(async (context: Context) => {
      if (context.path.length < 2) {
        return;
      }

      const [
        serviceName,
        methodName,
      ] = context.path;

      if (serviceName !== serviceMetaInfo.name) {
        return;
      }

      const serviceMethodMetaInfo = serviceMetaInfo.methods[methodName];
      if (!serviceMethodMetaInfo) {
        return;
      }

      let argIndx = 0;
      const areNamedArgs = !Array.isArray(context.args);
      const contextArgs = context.args || (areNamedArgs ? {} : []);
      const args = serviceMethodMetaInfo.args.map((serviceMethodArgumentMetaInfo) => {
        switch (serviceMethodArgumentMetaInfo.source) {
          case ServiceMethodArgumentSource.inject:
            return (<any>context)[serviceMethodArgumentMetaInfo.name.slice(1)];

          case ServiceMethodArgumentSource.input:
            const arg = areNamedArgs
              ? contextArgs[serviceMethodArgumentMetaInfo.name]
              : contextArgs[argIndx];
            argIndx += 1;
            return arg;
        }

        return undefined;
      });

      return await Promise.resolve(
        serviceMethodMetaInfo.instance.call(serviceMetaInfo.instance, ...args),
      );
    });

    return this;
  }

  async invoke(...args: any[]): Promise<any> {
    const splitedPath = splitPath(...args);
    if (!splitedPath) {
      return undefined;
    }

    const context = {
      ...splitedPath,
      value: undefined,
    };

    for (const middlewareHandler of this.middlewaresHandlers) {
      context.value = await middlewareHandler(context) || context.value;
    }

    return context.value;
  }
}

function splitPath(...args: any[]): { path: string[], args: any, pathTail: any[] } | undefined {
  const argsPos = args.findIndex(arg => typeof arg !== 'string');
  if (argsPos === -1) {
    return undefined;
  }

  return {
    path: args.slice(0, argsPos),
    args: args[argsPos],
    pathTail: args.slice(argsPos + 1),
  };
}
