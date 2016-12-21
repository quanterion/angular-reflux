import { ChangeEvent } from '../../../../src/virtual-scroll';
import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { ListItem } from './list-item.component';
import { OnChanges } from '@angular/core';
import { SimpleChanges } from '@angular/core';

@Component({
    selector: 'list-with-api',
    template: `
        <div class="status">
             Showing <span class="badge">{{indices?.start + 1}}</span>
             - <span class="badge">{{indices?.end}}</span>
             of <span class="badge">{{buffer?.length}}</span>
            <span>({{scrollItems?.length}} nodes)</span>
        </div>

        <virtual-scroll
            [items]="buffer"
            (update)="scrollItems = $event"
            (change)="onListChange($event)">

            <list-item *ngFor="let item of scrollItems" [item]="item"> </list-item>
            <div *ngIf="loading" class="loader">Loading...</div>

        </virtual-scroll>
    `,
    styleUrls: ['./list-with-api.scss']
})
export class ListWithApiComponent implements OnChanges {

    @Input()
    items: ListItem[];

    protected indices: ChangeEvent;
    protected buffer: ListItem[] = [];
    protected readonly bufferSize: number = 10;
    protected timer;
    protected loading: boolean;

    ngOnChanges(changes: SimpleChanges) {
        this.reset();
    }

    protected reset() {
        this.fetchNextChunk(0, this.bufferSize)
            .then(chunk => this.buffer = chunk);
    }

    protected onListChange(event: ChangeEvent) {
        this.indices = event;
        if (event.end === this.buffer.length) {
            this.loading = true;
            this.fetchNextChunk(this.buffer.length, this.bufferSize)
                .then(chunk => {
                    this.buffer = this.buffer.concat(chunk);
                    this.loading = false;
                }, () => this.loading = false);
        }
    }

    protected fetchNextChunk(skip: number, limit: number): Promise<ListItem[]> {
        return new Promise((resolve, reject) => {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                if (skip < this.items.length) {
                    return resolve(this.items.slice(skip, skip + limit));
                }
                reject();
            }, 1000 + Math.random() * 1000);
        });
    }
}