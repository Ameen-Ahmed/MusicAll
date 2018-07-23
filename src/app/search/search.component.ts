import { Component, OnInit } from '@angular/core';
import { WebService } from '../web.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  searchOptions = {
    query: '',
    type: '',
    limit: '',
  };

  platforms = {
      spotify: false,
      youtube: false,
      itunes: false,
      audiomack: false,
      soundcloud: false
  };

  platform_keys = Object.keys(this.platforms);

  constructor(private webService: WebService) { }

  ngOnInit() {
    this.searchOptions = JSON.parse(localStorage.getItem('searchOptions')) || this.searchOptions;
    this.platforms = JSON.parse(localStorage.getItem('platforms')) || this.platforms;
  }

  post() {
    localStorage.setItem('searchOptions', JSON.stringify(this.searchOptions));
    localStorage.setItem('platforms', JSON.stringify(this.platforms));
    this.webService.searchPlatforms(this.searchOptions, this.platforms);
  }

  cancel() {
    localStorage.removeItem('searchOptions');
    localStorage.removeItem('platforms');

    this.searchOptions = {
      query: '',
      type: '',
      limit: '',
    };

    this.platforms = {
      spotify: false,
      youtube: false,
      itunes: false,
      audiomack: false,
      soundcloud: false
  };
  }

}
