import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Wait for initial auth loading if necessary
  if (auth.loading()) {
    await auth.initAuth();
  }

  if (auth.isAuthenticated() && auth.isAdmin()) {
    return true;
  }

  return router.createUrlTree(['/admin/login'], { queryParams: { from: state.url } });
};
