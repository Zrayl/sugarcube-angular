import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SugarCubeStoryComponent } from "./components/sugarcube-story/sugarcube-story.component";
import { AngularPassageComponent } from "./components/angular-passage/angular-passage.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SugarCubeStoryComponent, AngularPassageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'sugarcube-angular';
}
