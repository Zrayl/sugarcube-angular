import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SugarCubeService } from './sugarcube.service';

@Injectable({
  providedIn: 'root'
})
export class SugarCubeStateService {
  private stateSubject = new BehaviorSubject<any>({});
  public state$ = this.stateSubject.asObservable();
  
  constructor(private sugarCubeService: SugarCubeService) {
    // Subscribe to story loaded event to initialize state
    this.sugarCubeService.storyLoaded$.subscribe(loaded => {
      if (loaded) {
        this.refreshState();
      }
    });
  }
  
  /**
   * Get a variable from the SugarCube state
   */
  getVariable(name: string): any {
    if (!window.SugarCube || !window.SugarCube.State) return null;
    
    return window.SugarCube.State.variables[name];
  }
  
  /**
   * Set a variable in the SugarCube state
   */
  setVariable(name: string, value: any): void {
    if (!window.SugarCube || !window.SugarCube.State) return;
    
    window.SugarCube.State.variables[name] = value;
    this.refreshState();
  }
  
  /**
   * Refresh the local copy of SugarCube state
   */
  private refreshState(): void {
    if (!window.SugarCube || !window.SugarCube.State) return;
    
    // Create a copy of the variables
    const variables = { ...window.SugarCube.State.variables };
    this.stateSubject.next(variables);
  }
}