import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Book } from 'src/app/models/Book';

@Component({
    selector: 'app-book-addition-dialog',
    templateUrl: 'book.addition.dialog.html',
})
export class BookAdditionDialogComponent {
    book: Book;
    locationStatuses: string[] = [
        'OWNED',
        'LOANED',
        'BORROWED',
        'WISHED',
    ];
    progressStatuses: string[] = [
        'READ',
        'UNREAD',
        'READING',
        'PLAN_TO_READ',
        'ABANDONED',
    ];
    addForm: FormGroup;

    constructor(public dialogRef: MatDialogRef<BookAdditionDialogComponent>,
                @Inject(MAT_DIALOG_DATA) data: Book,
                private formBuilder: FormBuilder) {
        this.book = data;
        this.addForm = this.formBuilder.group({
            location : [null, Validators.required],
            progress : [null, Validators.required],
            comment : [null, null]
        });
    }

    onAdditionClick(form: FormGroup): void {
        this.dialogRef.close(['ADD', form.value.location, form.value.progress, form.value.comment]);
    }

    onCancelClick(): void {
      this.dialogRef.close('CANCEL');
    }
}
