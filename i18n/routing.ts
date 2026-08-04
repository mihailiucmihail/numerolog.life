import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // Limbile suportate
  locales: ['ro', 'ru'],

  // Limba implicita (cand nu se potriveste nimic)
  defaultLocale: 'ru',

  // Prefix intotdeauna prezent in URL (/ro/..., /ru/...)
  localePrefix: 'always',
})
