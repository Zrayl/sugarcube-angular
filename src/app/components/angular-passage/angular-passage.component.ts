// src/app/components/angular-passage/angular-passage.component.ts
import { Component, Input, OnChanges } from '@angular/core';
import { SugarCubeService } from '../../services/sugarcube.service';

@Component({
  selector: 'app-angular-passage',
  template: `
    <div class="angular-passage">
      <h2>{{ passageTitle }}</h2>
      <div [innerHTML]="processedContent"></div>
      <div class="links">
        <button *ngFor="let link of links" (click)="goToPassage(link)">
          {{ link }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .angular-passage {
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    .links {
      margin-top: 20px;
    }
    button {
      margin-right: 10px;
      padding: 5px 10px;
    }
  `]
})
export class AngularPassageComponent implements OnChanges {
  @Input() passageTitle: string = '';
  
  processedContent: string = '';
  links: string[] = [];
  
  constructor(private sugarCubeService: SugarCubeService) {}
  
  ngOnChanges(): void {
    if (this.passageTitle) {
      this.loadPassage();
    }
  }
  
  private loadPassage(): void {
    const story = this.sugarCubeService.getStory();
    if (!story) return;
    
    const passage = story.get(this.passageTitle);
    if (!passage) return;
    
    // Process content - might need custom processing depending on your needs
    this.processedContent = passage.processText();
    
    // Extract links (simplified example)
    this.links = this.extractLinks(passage.text);
  }
  
  private extractLinks(text: string): string[] {
    // Simple regex to find passage links - might need enhancement
    const linkRegex = /\[\[(.*?)\]\]/g;
    const matches = text.match(linkRegex) || [];
    
    return matches.map(match => {
      // Remove [[ and ]]
      return match.substring(2, match.length - 2);
    });
  }
  
  goToPassage(link: string): void {
    // Update current passage
    this.passageTitle = link;
    this.loadPassage();
  }
}