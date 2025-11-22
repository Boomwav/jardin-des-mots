import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WordListService } from '../../services/word-list.service';
import { ListeMots } from '../../../models';

@Component({
  selector: 'app-word-list-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './word-list-form.component.html',
  styleUrls: ['./word-list-form.component.css']
})
export class WordListFormComponent implements OnInit {
  wordListForm: FormGroup;
  profilId!: number;
  listId: string | null = null;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private wordListService: WordListService
  ) {
    this.wordListForm = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      mots: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.profilId = Number(this.route.snapshot.paramMap.get('id'));
    this.listId = this.route.snapshot.paramMap.get('listId');
    this.isEditMode = this.listId !== 'new' && this.listId !== null;

    if (this.isEditMode) {
      this.loadWordList();
    }
  }

  loadWordList(): void {
    // We need a get by id method, for now, we get all and filter
    this.wordListService.getWordLists(this.profilId).subscribe(lists => {
      const list = lists.find(l => l.id == Number(this.listId));
      if (list) {
        this.wordListForm.patchValue({
          titre: list.titre,
          description: list.description,
          mots: list.mots.join('\\n')
        });
      }
    });
  }

  onSubmit(): void {
    if (this.wordListForm.invalid) {
      return;
    }

    const formValue = this.wordListForm.value;
    const wordsArray = formValue.mots.split('\\n').map((word: string) => word.trim()).filter((word: string) => word.length > 0);

    const wordListData: ListeMots = {
      id: this.isEditMode ? Number(this.listId) : 0, // Backend will assign new ID
      titre: formValue.titre,
      description: formValue.description,
      mots: wordsArray
    };

    if (this.isEditMode) {
      this.wordListService.updateWordList(this.profilId, wordListData).subscribe(() => {
        this.router.navigate(['/parent/manage', this.profilId]);
      });
    } else {
      this.wordListService.addWordList(this.profilId, wordListData).subscribe(() => {
        this.router.navigate(['/parent/manage', this.profilId]);
      });
    }
  }
}
