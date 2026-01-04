import { Routes } from '@angular/router';
import { ArticlesList } from './components/articles-list/articles-list';
import { Settings } from './components/settings/settings';

export const routes: Routes = [
  { path: '', redirectTo: '/articles', pathMatch: 'full' },
  { path: 'articles', component: ArticlesList },
  { path: 'settings', component: Settings }
];
