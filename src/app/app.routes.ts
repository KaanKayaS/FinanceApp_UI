import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/layout/main-layout.component';
import { AuthGuard } from './services/auth.guard';
import { AuthLoginGuard } from './services/auth-login.guard';
import { PaymentHistoryComponent } from './components/transactions/payment-history/payment-history.component';
import { ExpenseAgendaComponent } from './components/transactions/expense-list/expense-agenda.component';
import { AddExpenseComponent } from './components/transactions/add-expense/add-expense.component';
import { CreateInstructionComponent } from './components/instructions/create-instruction/create-instruction.component';
import { InstructionListComponent } from './components/instructions/instruction-list/instruction-list.component';
import { CreateMembershipComponent } from './components/membership/create-membership/create-membership.component';
import { SubscriptionListComponent } from './components/membership/subscription-list/subscription-list.component';
import { CreateInvestmentPlanComponent } from './components/investment/create-investment-plan/create-investment-plan.component';
import { InvestmentListComponent } from './components/investment/investment-list/investment-list.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./components/home/home').then(m => m.HomeComponent)
      },
      {
        path: 'cards',
        loadComponent: () => import('./components/cards/cards').then(m => m.CardsComponent)
      },
      {
        path: 'cards/add-balance',
        loadComponent: () => import('./components/cards/add-balance/add-balance').then(m => m.AddBalanceComponent)
      },
      {
        path: 'cards/add',
        loadComponent: () => import('./components/cards/add-card/add-card.component').then(m => m.AddCardComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./components/transactions/transactions').then(m => m.TransactionsComponent)
      },
      {
        path: 'payment-history',
        component: PaymentHistoryComponent,
        title: 'Ödeme Geçmişim'
      },
      {
        path: 'manual-expenses',
        component: ExpenseAgendaComponent,
        title: 'Gider Ajandası'
      },
      {
        path: 'add-expense',
        component: AddExpenseComponent,
        title: 'Gider Ekle'
      },
      {
        path: 'instructions/create',
        component: CreateInstructionComponent,
        title: 'Talimat Oluştur'
      },
      {
        path: 'instructions/list',
        component: InstructionListComponent,
        title: 'Talimatlarım'
      },
      {
        path: 'membership/create',
        component: CreateMembershipComponent,
        title: 'Dijital Platform Aboneliği'
      },
      {
        path: 'subscriptions',
        component: SubscriptionListComponent,
        title: 'Aboneliklerim'
      },
      {
        path: 'investment/create',
        component: CreateInvestmentPlanComponent,
        title: 'Yatırım Planı Oluştur'
      },
      {
        path: 'investment/list',
        component: InvestmentListComponent,
        title: 'Yatırım Planlarım'
      },
      {
        path: 'profile',
        loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
        title: 'Profil'
      },
      {
        path: 'about',
        component: AboutComponent,
        title: 'Hakkımızda'
      },
      {
        path: 'contact',
        component: ContactComponent,
        title: 'İletişim'
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'login',
    canActivate: [AuthLoginGuard],
    loadComponent: () => import('./components/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [AuthLoginGuard],
    loadComponent: () => import('./components/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    canActivate: [AuthLoginGuard],
    loadComponent: () => import('./components/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    canActivate: [AuthLoginGuard],
    loadComponent: () => import('./components/reset-password/reset-password').then(m => m.ResetPasswordComponent)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
