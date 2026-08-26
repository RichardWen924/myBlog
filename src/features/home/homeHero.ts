export interface WelcomeWord {
  label: string;
  lang: string;
}

export interface GreetingCycle {
  previous: WelcomeWord | undefined;
  current: WelcomeWord | undefined;
  next: WelcomeWord | undefined;
  position: number;
  total: number;
}

export interface HomeMotionProfile {
  entranceDuration: number;
  transitionDuration: number;
  greetingHold: number;
  greetingLoop: boolean;
  pointerShift: number;
}

export const WELCOME_WORDS = [
  { label: 'HELLO', lang: 'en' },
  { label: '你好', lang: 'zh-CN' },
  { label: 'BONJOUR', lang: 'fr' },
  { label: 'HOLA', lang: 'es' },
  { label: 'OLÁ', lang: 'pt' },
  { label: 'CIAO', lang: 'it' },
  { label: 'こんにちは', lang: 'ja' },
  { label: '안녕하세요', lang: 'ko' },
] as const satisfies readonly WelcomeWord[];

export function getGreetingCycle(index: number): GreetingCycle {
  const total = WELCOME_WORDS.length;
  const normalizedIndex = ((index % total) + total) % total;

  return {
    previous: WELCOME_WORDS[(normalizedIndex - 1 + total) % total],
    current: WELCOME_WORDS[normalizedIndex],
    next: WELCOME_WORDS[(normalizedIndex + 1) % total],
    position: normalizedIndex + 1,
    total,
  };
}

export function getGreetingRotation(step: number, total: number = WELCOME_WORDS.length): number {
  return (360 / total) * (step + 1);
}

export function getHomeMotionProfile(reducedMotion: boolean): HomeMotionProfile {
  if (reducedMotion) {
    return {
      entranceDuration: 0,
      transitionDuration: 0,
      greetingHold: 0,
      greetingLoop: false,
      pointerShift: 0,
    };
  }

  return {
    entranceDuration: 1.15,
    transitionDuration: 0.62,
    greetingHold: 2.15,
    greetingLoop: true,
    pointerShift: 8,
  };
}
