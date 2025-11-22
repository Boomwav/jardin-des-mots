import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ListeMots } from '../../../models';
import { WordListService } from '../../services/word-list.service';
import { ApiService } from '../../../services/api.service';
import { Profil } from '../../../models';

@Component({
  selector: 'app-manage-lists',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manage-lists.component.html',
  styleUrls: ['./manage-lists.component.css']
})
export class ManageListsComponent implements OnInit {
  profilId!: number;
  profil: Profil | undefined;
  wordLists: ListeMots[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private wordListService: WordListService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.profilId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProfile();
    this.loadWordLists();
  }

  loadProfile(): void {
    this.apiService.getData().subscribe(data => {
      this.profil = data.profils.find(p => p.id === this.profilId);
    });
  }

  loadWordLists(): void {
    this.wordListService.getWordLists(this.profilId).subscribe(lists => {
      this.wordLists = lists;
    });
  }

  deleteList(listId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette liste ?')) {
      this.wordListService.deleteWordList(this.profilId, listId).subscribe(() => {
        this.loadWordLists(); // Refresh the list
      });
    }
  }
}
