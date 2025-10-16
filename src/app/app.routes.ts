import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";
import { LoginComponent } from "./features/auth/login/login.component";
import { SignupComponent } from "./features/auth/signup/signup.component";
import { LayoutComponent } from "./shared/components/layout/layout.component";
import { roleGuard } from "./core/guards/role.guard";

export const routes: Routes = [
  { path: "", redirectTo: "/login", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  { path: "signup", component: SignupComponent },
  {
    path: "",
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: "dashboard",
        canActivate: [roleGuard],
        loadComponent: () =>
          import("./features/dashboard/dashboard.component").then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: "tasks",

        loadComponent: () =>
          import("./features/tasks/tasks.component").then(
            (m) => m.TasksComponent
          ),
      },
      {
        path: "leaves",
        loadComponent: () =>
          import("./features/leaves/leaves.component").then(
            (m) => m.LeavesComponent
          ),
      },
    ],
  },
];
