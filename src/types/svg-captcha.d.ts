declare module "svg-captcha" {
  export type CaptchaOptions = {
    size?: number;
    ignoreChars?: string;
    noise?: number;
    color?: boolean;
    background?: string;
    width?: number;
    height?: number;
    fontSize?: number;
    charPreset?: string;
  };

  export type CaptchaResult = {
    text: string;
    data: string;
  };

  export function create(options?: CaptchaOptions): CaptchaResult;

  const svgCaptcha: { create: typeof create };
  export default svgCaptcha;
}
