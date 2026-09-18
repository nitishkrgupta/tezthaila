import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  if (auth.loading()) {
    await auth.initAuth();
  }

  if (auth.isAuthenticated()) {
    return true;
  }

  toast.info('Please log in first to access this page');
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
