import { Component, OnInit, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { ResultDirective } from '../result.directive';
import { MediaItem } from '../media-item';
import { MediaItemComponent } from '../media-item/media-item.component';
import { WebService } from '../web.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
  mediaItems: MediaItem[] = [];
  @ViewChild(ResultDirective) resultHost: ResultDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private webService: WebService, private router: Router) { }

  ngOnInit() {
    const ResponseObservable = this.webService.getResults();
    ResponseObservable.subscribe(response => {
      this.mediaItems.push(new MediaItem(MediaItemComponent, JSON.parse(response['_body'])));
      this.loadComponent();
    }, error => console.log(error), () => {
      localStorage.setItem('lastSearch', JSON.stringify(this.mediaItems));
    });
  }
  loadComponent() {
    const mediaItem = this.mediaItems[this.mediaItems.length - 1];
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(mediaItem.component);
    const viewContainerRef = this.resultHost.viewContainerRef;
    const componentRef = viewContainerRef.createComponent(componentFactory);
    (<MediaItemComponent>componentRef.instance).data = mediaItem.data;
  }

  navigateBack() {
    this.router.navigate(['/']);
  }
}
