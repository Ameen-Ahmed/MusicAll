import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { merge, ReplaySubject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebService {
  BASE_URL: string = environment.hostUrl + '/api';

  private resultObs$: ReplaySubject<any> = new ReplaySubject(5);
  private lastSearch: Object;

  constructor(private http: Http, private router: Router) { }

  searchPlatforms(parameters, platforms) {
    if (JSON.stringify({ parameters, platforms }) !== JSON.stringify(this.lastSearch)) {
      delete this.resultObs$;
      this.resultObs$ = new ReplaySubject(5);
      this.lastSearch = { parameters, platforms };

      platforms = Object.keys(platforms).filter(key => platforms[key]);
      const args = platforms.map(platform => this.http.post(this.BASE_URL + '/' + platform, parameters));
      merge(...args).subscribe(data => {
        this.resultObs$.next(data);
      }, error => this.resultObs$.error(error));
    }
    this.router.navigate(['/results']);
  }
  getResults() {
    return this.resultObs$;
  }
}
