declare module 'react-native-currency-converter' {
  interface ConvertOptions {
    from: string;
    to: string;
    amount: number;
  }

  const CurrencyConverter: {
    convert(options: ConvertOptions): Promise<number>;
  };

  export default CurrencyConverter;
}
