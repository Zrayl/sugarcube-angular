import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

declare global {
  interface Window {
    SugarCube: any;
    setup: any;
    Story: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class SugarCubeService {
  private storyLoadedSubject = new BehaviorSubject<boolean>(false);
  public storyLoaded$ = this.storyLoadedSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Loads compiled story content from a file
   */
  loadStory(storyPath: string): Observable<string> {
    return this.http.get(storyPath, { responseType: 'text' });
  }

  /**
   * Initialize SugarCube from loaded HTML content
   */
  initializeSugarCube(htmlContent: string, containerElement: HTMLElement): void {
    // Create a temporary div to hold the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Extract scripts from the HTML content
    const scripts = tempDiv.querySelectorAll('script');
    
    // First, append all non-script elements
    containerElement.innerHTML = tempDiv.innerHTML;
    
    // Then re-execute scripts in order (they were invalidated when using innerHTML)
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      
      // Copy all attributes
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Copy inline script content
      newScript.textContent = oldScript.textContent;
      
      // Replace old script with new one to execute it
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
    
    // Notify that the story is loaded
    this.storyLoadedSubject.next(true);
  }

  /**
   * Get reference to the SugarCube Story object
   */
  getStory(): any {
    return window.Story;
  }

  /**
   * Access the setup object
   */
  getSetup(): any {
    return window.setup;
  }
}