import { MSC } from '../../src/lib';
import { BasicService } from './BasicService';
import { Context } from '../../src/Context';

test('service', async () => {
  const host = new MSC()
    .use(async () => 1)
    .use(async ({ value }: Context) => value + 2)
    .host('basicService', new BasicService())
    .use(async ({ value }: Context) => value + 1);

  expect(await host.invoke('basicService.add', { a: 1, b: 2 })).toBe(7);

  console.log(1);
});
