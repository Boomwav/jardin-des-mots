import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Profil, DbData } from '../../../models';
import { ApiService } from '../../../services/api';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './parent-dashboard.component.html',
  styleUrls: ['./parent-dashboard.component.css']
})
export class ParentDashboardComponent implements OnInit {
  profils: Profil[] = [];

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.apiService.getData().subscribe((data: DbData) => {
      this.profils = data.profils;
    });
  }

  selectProfil(id: number): void {
    this.router.navigate(['/parent/manage', id]);
  }
}
