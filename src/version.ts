declare const __PURIST_VERSION__: string

export const PURIST_VERSION: string =
  typeof __PURIST_VERSION__ !== 'undefined' ? __PURIST_VERSION__ : '0.0.0-dev'
