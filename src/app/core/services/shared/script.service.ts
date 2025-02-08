import { Injectable } from '@angular/core';
import { CommonService } from '../common/common.service';

interface Scripts {
  name: string;
  src: string;
}
export const ScriptStore: Scripts[] = [
  {name: 'external', src: 'assets/js/external.js'},
];

@Injectable({
  providedIn: 'root'
})
export class ScriptService {
  private scripts: any = {};

  constructor(public commonService: CommonService) {
    ScriptStore.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: this.commonService.contentRelativePath(script.src)
      };
    });
   }
   load(...scripts: string[]) {
    const promises: any[] = [];
    scripts.forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises);
  }
  loadScript(name: string) {
    return new Promise((resolve, reject) => {
      // resolve if already loaded
      if (this.scripts[name].loaded) {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      } else {
        // load script
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = this.scripts[name].src;
        script.onload = () => {
          this.scripts[name].loaded = true;
          console.log(`${name} Loaded.`);
          resolve({ script: name, loaded: true, status: 'Loaded' });
        };
        script.onerror = (error: any) => resolve({ script: name, loaded: false, status: 'Loaded' });
        document.getElementsByTagName('head')[0].appendChild(script);
      }
    });
  }
}
