import { Routes } from '@angular/router';
import { LoggedInUserGuard } from '@clientApp-core/gaurds/logged-in-user.guard';

export const appRoutes: Routes = [
    {
        path: '',
        canActivate: [LoggedInUserGuard],
        loadChildren: () => import('./features/layouts/home-layout/home.module').then(m => m.HomeModule),
      },
      {
        path: '',
        loadChildren: () => import('./features/layouts/login-layout/login-layout.module').then(m => m.LoginLayoutModule)
      },
      {
        path: 'authentication',
        loadChildren: () => import('./features/authentication/authentication.module').then(m => m.AuthenticationModule)
      },
      {
        path: 'verify',
        loadChildren: () => import('./features/email-verification/email-verification.module').then(m => m.EmailVerificationModule)
      },
      {
        path: '404',
        loadChildren: () => import('./features/not-found/not-found.module').then(m => m.NotFoundModule)
      },
      {
        path: '**',
        redirectTo: 'login'
      }
];
