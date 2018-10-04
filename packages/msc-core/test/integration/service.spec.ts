import { MSC } from '../../src/lib';
import { BasicService } from './BasicService';
import { Context } from '../../src/Context';

test('service', async () => {
  const msc = new MSC()
    .use(async () => 1)
    .use(async ({ value }: Context) => value + 2)
    .host('basicService', new BasicService())
    .use(async ({ value }: Context) => value + 1);

  expect(await msc.invoke('basicService', 'add', { a: 1, b: 2 })).toBe(1 + 2 + 3 + 1);
  expect(await msc.invoke('basicService', 'add', [1, 2])).toBe(1 + 2 + 3 + 1);
  expect(await msc.invoke('basicService', 'test', [400], 'add', [200])).toBe(1 + 2 + 600 + 1);
});
