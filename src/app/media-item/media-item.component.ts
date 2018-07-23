import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-media-item',
  templateUrl: './media-item.component.html',
  styleUrls: ['./media-item.component.scss']
})
export class MediaItemComponent implements OnInit {
  @Input() data: any;

  constructor() { }

  ngOnInit() {
  }

}
