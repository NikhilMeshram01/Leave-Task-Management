// import { inject } from "@angular/core";
// import { Router, CanActivateFn } from "@angular/router";
// import { AuthService } from "../services/auth.service";

// export const authGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   if (authService.isAuthenticated()) {
//     return true;
//   }

//   router.navigate(["/login"]);
//   return false;
// };

import { inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ✅ Wait for Supabase initialization
  while (!authService.isAuthReady()) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // ✅ Then check authentication
  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(["/login"]);
  return false;
};
