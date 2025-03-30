import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SugarcubeStoryComponent } from './sugarcube-story.component';

describe('SugarcubeStoryComponent', () => {
  let component: SugarcubeStoryComponent;
  let fixture: ComponentFixture<SugarcubeStoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SugarcubeStoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SugarcubeStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
