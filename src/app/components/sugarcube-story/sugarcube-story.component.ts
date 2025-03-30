// src/app/components/sugarcube-story/sugarcube-story.component.ts
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { SugarCubeService } from '../../services/sugarcube.service';

@Component({
  selector: 'app-sugarcube-story',
  template: `
    <div #storyContainer class="story-container"></div>
  `,
  styles: [
    `.story-container {
      width: 100%;
      height: 100%;
      min-height: 400px;
      overflow: auto;
    }`
  ]
})
export class SugarCubeStoryComponent implements OnInit {
  @ViewChild('storyContainer', { static: true }) storyContainer!: ElementRef;
  @Input() storyPath: string = 'assets/stories/index.html';

  constructor(private sugarCubeService: SugarCubeService) {}

  ngOnInit(): void {
    this.loadStory();
  }

  private loadStory(): void {
    this.sugarCubeService.loadStory(this.storyPath).subscribe(
      (htmlContent) => {
        this.sugarCubeService.initializeSugarCube(
          htmlContent, 
          this.storyContainer.nativeElement
        );
      },
      (error) => {
        console.error('Failed to load story:', error);
      }
    );
  }
}