// import { inject } from "@angular/core";
// import { Router, CanActivateFn } from "@angular/router";
// import { AuthService } from "../services/auth.service";

// export const roleGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   if (authService.isAdmin()) {
//     return true;
//   }

//   router.navigate(["/dashboard"]);
//   return false;
// };

import { inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is logged in first
  const user = authService.currentUser();

  if (!user) {
    router.navigate(["/login"]);
    return false;
  }

  // Allow only admins
  if (user.role === "admin") {
    return true;
  }

  // If not admin, redirect to tasks or some other page
  router.navigate(["/tasks"]);
  return false;
};
