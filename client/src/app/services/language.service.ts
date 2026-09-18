import { Injectable, signal } from '@angular/core';
import { enTranslations } from '../i18n/en';
import { hiTranslations } from '../i18n/hi';

export type Language = 'en' | 'hi';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly storageKey = 'tez_thaila_lang';

  currentLang = signal<Language>('en');

  private translations: Record<Language, Record<string, string>> = {
    en: enTranslations,
    hi: hiTranslations
  };

  constructor() {
    this.initLanguage();
  }

  private initLanguage(): void {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(this.storageKey) as Language | null;
    if (saved === 'en' || saved === 'hi') {
      this.currentLang.set(saved);
    } else {
      this.currentLang.set('en');
    }
  }

  toggleLang(): void {
    const nextLang: Language = this.currentLang() === 'en' ? 'hi' : 'en';
    this.currentLang.set(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, nextLang);
    }
  }

  setLang(lang: Language): void {
    this.currentLang.set(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, lang);
    }
  }

  t(key: string, fallback = ''): string {
    const lang = this.currentLang();
    return this.translations[lang]?.[key] || this.translations['en']?.[key] || fallback || key;
  }

  getCategoryName(slugOrName: string, defaultName?: string): string {
    if (!slugOrName) return defaultName || '';
    const clean = slugOrName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const directKey = `cat_${clean}`;
    const directTranslation = this.t(directKey);
    if (directTranslation && directTranslation !== directKey) {
      return directTranslation;
    }

    const mapping: Record<string, string> = {
      groceries: 'cat_groceries_staples',
      staples: 'cat_groceries_staples',
      dairy: 'cat_dairy_breakfast',
      breakfast: 'cat_dairy_breakfast',
      fruits: 'cat_fresh_fruits_vegetables',
      vegetables: 'cat_fresh_fruits_vegetables',
      fresh: 'cat_fresh_fruits_vegetables',
      snacks: 'cat_snacks_beverages',
      beverages: 'cat_snacks_beverages',
      personal: 'cat_personal_home_care',
      electronics: 'cat_electronics_audio',
      audio: 'cat_electronics_audio',
      cleaning: 'cat_cleaning_household',
      household: 'cat_cleaning_household',
      baby: 'cat_baby_pet_care',
      pet: 'cat_baby_pet_care'
    };

    for (const [sub, key] of Object.entries(mapping)) {
      if (clean.includes(sub)) {
        return this.t(key);
      }
    }

    return defaultName || slugOrName;
  }
}
