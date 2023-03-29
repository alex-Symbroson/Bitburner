
export interface ITheme {
  primarylight: string;
  primary: string;
  primarydark: string;
  successlight: string;
  success: string;
  successdark: string;
  errorlight: string;
  error: string;
  errordark: string;
  secondarylight: string;
  secondary: string;
  secondarydark: string;
  warninglight: string;
  warning: string;
  warningdark: string;
  infolight: string;
  info: string;
  infodark: string;
  welllight: string;
  well: string;
  white: string;
  black: string;
  hp: string;
  money: string;
  hack: string;
  combat: string;
  cha: string;
  int: string;
  rep: string;
  disabled: string;
  backgroundprimary: string;
  backgroundsecondary: string;
  button: string;
}

export interface IPredefinedTheme {
  colors: ITheme;
  name: string;
  credit: string;
  screenshot: string;
  description: string;
  reference?: string;
}
