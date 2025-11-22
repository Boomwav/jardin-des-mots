import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParentDashboardComponent } from './pages/parent-dashboard/parent-dashboard.component';
import { ManageListsComponent } from './pages/manage-lists/manage-lists.component';
import { WordListFormComponent } from './pages/word-list-form/word-list-form.component';

const routes: Routes = [
  {
    path: '',
    component: ParentDashboardComponent
  },
  {
    path: 'manage/:id',
    component: ManageListsComponent
  },
  {
    path: 'manage/:id/edit/new',
    component: WordListFormComponent
  },
  {
    path: 'manage/:id/edit/:listId',
    component: WordListFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParentRoutingModule { }
