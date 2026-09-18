import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'system' | 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storageKey = 'tez_thaila_theme';

  theme = signal<ThemeMode>('system');
  isDark = signal<boolean>(false);

  constructor() {
    this.initTheme();
  }

  private initTheme(): void {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(this.storageKey) as ThemeMode | null;
    if (saved === 'light' || saved === 'dark') {
      this.theme.set(saved);
      this.applyTheme(saved === 'dark');
    } else {
      this.theme.set('system');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(prefersDark);
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (this.theme() === 'system') {
        this.applyTheme(e.matches);
      }
    });
  }

  toggleTheme(): void {
    const nextDark = !this.isDark();
    const nextMode: ThemeMode = nextDark ? 'dark' : 'light';
    this.theme.set(nextMode);
    localStorage.setItem(this.storageKey, nextMode);
    this.applyTheme(nextDark);
  }

  setTheme(mode: ThemeMode): void {
    this.theme.set(mode);
    if (mode === 'system') {
      localStorage.removeItem(this.storageKey);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(prefersDark);
    } else {
      localStorage.setItem(this.storageKey, mode);
      this.applyTheme(mode === 'dark');
    }
  }

  private applyTheme(dark: boolean): void {
    this.isDark.set(dark);
    if (typeof document !== 'undefined') {
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
}
