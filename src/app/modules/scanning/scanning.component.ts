import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Book } from 'src/app/models/Book';
import { UserBook } from 'src/app/models/UserBook';
import { SearchService } from 'src/app/services/search.service';
import { UserBookService } from 'src/app/services/userbook.service';
import { BookAdditionDialogComponent } from '../dialogs/book.addition.component';

@Component({
  selector: 'app-scanning',
  templateUrl: './scanning.component.html',
  styleUrls: ['./scanning.component.scss']
})
export class ScanningComponent implements OnInit {
    foundBooks: Book[];
    loading: boolean;
    searchCriteria: string;
    subject: Subject<any> = new Subject();

    constructor(private titleService: Title,
                private searchService: SearchService,
                private userBookService: UserBookService,
                private dialog: MatDialog,
                private snackBar: MatSnackBar) {
        this.titleService.setTitle('Book Finder - Library Tracker');
    }

    ngOnInit() {
        this.subject
            .pipe(debounceTime(800))
            .subscribe(() => {
                this.findBook();
            }
        );
    }

    decodeImage(event: any): void {
        this.loading = true;
        const reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        reader.onload = () => {
            this.searchService.decodeBarcode((reader.result as string).split(',')[1])
                .subscribe(res => { this.searchCriteria = res;
                                    this.findBook();
                                    this.loading = false; },
                           err => { this.snackBar.open('Something went wrong while decoding the barcode.', 'Dismiss', {
                                        duration: 2000,
                                    });
                                    console.log(err);
                                    this.loading = false; },
                        );
        };
    }

    onSearchKeyUp(): void {
        this.subject.next();
    }

    findBook(): void {
        if (this.searchCriteria) {
            this.loading = true;
            this.searchService.searchGoogleBooks(this.searchCriteria)
                .subscribe(res => { this.foundBooks = res;
                                    this.loading = false; },
                           err => { this.snackBar.open('Something went wrong while looking for books.', 'Dismiss', {
                                        duration: 2000,
                                    });
                                    console.log(err);
                                    this.loading = false; },
                        );
        } else {
            this.foundBooks = null;
        }
    }

    addBook(index: number, locationStatus: string, progressStatus: string): void {
        const userBook = new UserBook();
        userBook.user_id = localStorage.getItem('user_id');
        userBook.book = this.foundBooks[index];
        userBook.location_status = locationStatus;
        userBook.progress_status = progressStatus;

        this.userBookService.postUserBook(userBook)
            .subscribe(res => { this.snackBar.open('Book added to personal library.', 'Dismiss', {
                                    duration: 2000,
                                }); },
                       err => { console.log(err);
                                this.snackBar.open('Something went wrong while adding the book.', 'Dismiss', {
                                    duration: 2000,
                                });
                            }
                    );
    }

    openAddBookDialog(index: number, book: Book): void {
        const dialogRef = this.dialog.open(BookAdditionDialogComponent, {
            data: book,
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result[0] === 'ADD') {
                this.addBook(index, result[1], result[2]);
            }
        });
    }
}
