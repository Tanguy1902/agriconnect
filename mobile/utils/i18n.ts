import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import fr from '../locales/fr.json';

const i18n = new I18n({
  fr,
}, {
  locale: Localization.locale || 'fr',
  defaultLocale: 'fr',
  enableFallback: true,
});

export default i18n;
