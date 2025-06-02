declare module 'currency-converter-lt' {
  class CurrencyConverter {
    from(currency: string): this;
    to(currency: string): this;
    amount(value: number): this;
    convert(): Promise<number>;
  }
  export = CurrencyConverter;
}
