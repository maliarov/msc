export class BasicService {

  public add($value: number, a: number, b: number) {
    return $value + a + b;
  }

  public test(a: number) {
    return {
      add: (b: number) => a + b,
    };
  }

}
