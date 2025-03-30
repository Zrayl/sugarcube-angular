# SugarCube-Angular Integration

This project integrates SugarCube, a powerful interactive fiction engine, with Angular, providing a modern framework for creating and deploying interactive narratives.

## Features

- ✅ Full SugarCube functionality wrapped in Angular components
- ✅ TypeScript support via `@types/twine-sugarcube`
- ✅ Automated Tweego installation and story compilation
- ✅ Dual integration options:
  - Native SugarCube story embedding
  - Angular component-based story navigation
- ✅ Support for standard .twee file format
- ✅ Build pipeline for production deployment

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [Angular CLI](https://angular.io/cli) (v19.2.0 or later)
- A basic understanding of Angular and SugarCube

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/sugarcube-angular.git
cd sugarcube-angular
```

2. Install dependencies:

```bash
npm install
```

This will automatically:
- Install all project dependencies
- Download and install Tweego (the SugarCube compiler)
- Install the SugarCube story format

## Project Structure

```
sugarcube-angular/
├── src/
│   ├── app/
│   │   ├── components/          # Angular components
│   │   │   ├── angular-passage/  # Angular wrapper for passages
│   │   │   └── sugarcube-story/  # Full SugarCube story container
│   │   ├── services/            # Angular services
│   │   │   ├── sugarcube.service.ts        # Core SugarCube functionality
│   │   │   └── sugarcube-state.service.ts  # State management
│   │   └── stories/             # Your stories in .twee format
│   │       └── mystory/         # A sample story
│   │           ├── Start.twee   # Starting passage
│   │           └── StoryData.twee # Story metadata
│   └── assets/
│       └── stories/             # Compiled HTML stories (generated)
├── scripts/
│   ├── build-stories.js         # Compiles .twee to HTML
│   └── install-tweego.js        # Downloads and installs Tweego
└── .tweego/                     # Tweego binaries (generated)
```

## Usage

### Development Server

Start the development server:

```bash
npm start
```

This will:
1. Compile all your .twee files into HTML
2. Launch the Angular development server
3. Open the application at `http://localhost:4200/`

### Creating Stories

1. Create a new directory under `src/stories/` for your story:

```bash
mkdir -p src/stories/mystory
```

2. Add at least two files:
   - `StoryData.twee` - Contains story metadata
   - `Start.twee` - Your starting passage

3. Add content to these files following SugarCube syntax

4. Start the development server to see your story in action

### Integration Options

This project provides two ways to integrate SugarCube:

#### Option 1: Full SugarCube Story Component

Use the `<app-sugarcube-story>` component to embed a complete SugarCube story:

```html
<app-sugarcube-story [storyPath]="'assets/stories/mystory.html'"></app-sugarcube-story>
```

This loads the entire SugarCube engine with its native UI.

#### Option 2: Angular-Wrapped Passages

Use the `<app-angular-passage>` component for more control over the UI:

```html
<app-angular-passage [passageTitle]="'Start'"></app-angular-passage>
```

This allows you to use Angular components and styling while still utilizing SugarCube's story engine.

## Working with SugarCube

### Adding Images

1. Create a folder for your images under `public/`:

```bash
mkdir -p public/images
```

2. Add your images to this folder

3. Reference them in your passages:

```
:: Example Passage
Here's an image:

<img src="images/my-image.jpg" alt="Description">
```

The build process automatically copies all files from the `public/` folder to your distribution.

### Accessing SugarCube State from Angular

Use the `SugarCubeStateService` to interact with SugarCube variables:

```typescript
import { Component } from '@angular/core';
import { SugarCubeStateService } from '../../services/sugarcube-state.service';

@Component({
  selector: 'app-my-component',
  template: `<div>Player name: {{playerName}}</div>`
})
export class MyComponent {
  playerName: string = '';
  
  constructor(private scState: SugarCubeStateService) {
    // Get a SugarCube variable
    this.playerName = this.scState.getVariable('playerName');
    
    // Set a SugarCube variable
    this.scState.setVariable('health', 100);
    
    // Subscribe to state changes
    this.scState.state$.subscribe(state => {
      this.playerName = state.playerName;
    });
  }
}
```

## Building for Production

To create a production build:

```bash
npm run build
```

This will:
1. Compile all your .twee files into HTML
2. Create an optimized Angular production build
3. Place the output in the `dist/sugarcube-angular/` directory

## Deployment

Deploy the contents of the `dist/sugarcube-angular/` directory to any static web server:

```bash
# Example using Firebase Hosting
npm install -g firebase-tools
firebase login
firebase init
# Select Hosting and point to dist/sugarcube-angular
firebase deploy
```

## Advanced Usage

### Custom SugarCube Macros

You can define custom macros by creating a file in your story directory:

```
// src/stories/mystory/macros.twee
:: Script [script]
// Define a custom macro
Macro.add('customMacro', {
  handler: function() {
    const $wrapper = $(document.createElement('div'));
    $wrapper.wiki(this.payload[0].contents);
    $wrapper.appendTo(this.output);
  }
});
```

### Custom Styling

To customize the appearance of your SugarCube story:

1. Create a CSS file in your story directory:

```
// src/stories/mystory/style.twee
:: Stylesheet [stylesheet]
body {
  font-family: 'Arial', sans-serif;
}

#story {
  max-width: 800px;
  margin: 0 auto;
}
```

## Troubleshooting

### Tweego Installation Issues

If Tweego fails to install automatically:

1. Download Tweego manually from [the official website](http://www.motoslave.net/tweego/)
2. Extract it to the `.tweego/` directory in the project root
3. Ensure the binary is executable (on Unix-like systems)

### SugarCube Integration Issues

If your story doesn't load correctly:

1. Check the browser console for errors
2. Verify that your .twee files are being compiled correctly (check `src/assets/stories/`)
3. Make sure any external resources (images, fonts, etc.) are properly referenced

## Resources

- [SugarCube Documentation](https://www.motoslave.net/sugarcube/2/docs/)
- [Angular Documentation](https://angular.dev/docs)
- [Tweego Documentation](https://www.motoslave.net/tweego/docs/)

## License

This project is licensed under the MIT License - see the LICENSE file for details.