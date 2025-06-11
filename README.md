# Family Tree Explorer 🌳

A beautiful, interactive family tree visualization built with React, Vite, and Chakra UI v2. This application allows you to explore family relationships through an intuitive tree structure with zoom, pan, and detailed person/family information.

## Features ✨

### Tree Visualization
- **True Tree Structure**: Proper hierarchical layout with parent-child connections
- **Visual Relationships**: Different line styles and arrows for:
  - Parent → Child relationships (solid blue lines with arrows)
  - Spouse relationships (dashed red lines with hearts)
- **Interactive Navigation**: Full whiteboard-style browsing experience
  - Drag to pan anywhere
  - Mouse wheel to zoom in/out
  - Double-click to reset view
  - Touch gestures support

### Family Data Management
- **Complete Person Profiles**: Name, birth/death dates, images, relationships
- **Multi-spouse Support**: Handle complex family structures
- **Generation Tracking**: Automatic generation categorization
- **Family Branch Organization**: Group by family surnames

### User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Professional Styling**: Clean, modern interface with Chakra UI
- **Interactive Cards**: Click any person for detailed information
- **Statistics Dashboard**: Family overview with counts and analytics
- **Dual View Modes**: 
  - Tree View: Hierarchical family tree with connections
  - Family View: Organized by family branches

### Advanced Features
- **Connection Controls**: Toggle visibility and opacity of relationship lines
- **Generation Filtering**: Focus on specific generations
- **Family Statistics**: Detailed analytics modal with:
  - Age distributions
  - Living vs deceased ratios
  - Family branch comparisons
  - Birth timeline analysis
- **Smooth Animations**: Fluid transitions and hover effects

## Data Structure 📊

The family tree uses a simple JSON format:

```json
{
  "familyTree": [
    {
      "id": 1,
      "name": "Maria Elena Rodriguez",
      "birth": 1920,
      "death": 1995,
      "image": "https://via.placeholder.com/150/FFB6C1/000000?text=ME",
      "spouse": [100],
      "children": [2, 3, 4, 5, 6, 7, 8, 9, 10],
      "generation": 0,
      "family": "main"
    }
  ]
}
```

### Field Descriptions:
- `id`: Unique identifier for each person
- `name`: Full name of the person
- `birth`: Birth year (required)
- `death`: Death year (null if living)
- `image`: Profile image URL (placeholder supported)
- `spouse`: Array of spouse IDs (supports multiple marriages)
- `children`: Array of children IDs
- `generation`: Generation level (0 = founders, 1 = children, etc.)
- `family`: Family branch identifier

## Getting Started 🚀

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone or download the project
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production
```bash
npm run build
```

## Usage Guide 📖

### Navigation Controls
- **Pan**: Click and drag anywhere on the canvas
- **Zoom**: Use mouse wheel or zoom buttons
- **Reset**: Double-click or use the reset button
- **Center**: Use the center button to focus on the tree

### View Modes
1. **Tree View**: Shows the complete family tree with visual connections
   - Toggle connection visibility
   - Adjust connection opacity
   - Filter by generation
   
2. **Family View**: Organized by family branches
   - Collapsible family sections
   - Individual family statistics
   - Member sorting by generation

### Interaction Features
- **Person Cards**: Click any person card to view detailed information
- **Statistics**: Click "Detailed Stats" for comprehensive family analytics
- **Family Branches**: Click family headers to expand/collapse sections

## Customization 🎨

### Themes
The application uses Chakra UI's theming system. Modify `src/theme.js` to customize:
- Colors
- Fonts
- Component styles
- Responsive breakpoints

### Family Data
Replace the data in `src/data/familyTree.json` with your family information. The application handles:
- Missing data gracefully (null values, empty arrays)
- Multiple generations
- Complex family structures
- Large family trees (optimized for performance)

## Technical Details 🔧

### Built With
- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **Chakra UI v2**: Component library and design system
- **react-zoom-pan-pinch**: Advanced zoom and pan functionality
- **date-fns**: Date manipulation utilities

### Performance Features
- **Optimized Rendering**: Efficient component updates
- **Smooth Animations**: Hardware-accelerated transforms
- **Responsive Layout**: Adaptive to different screen sizes
- **Memory Efficient**: Optimized for large family trees

### Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing 🤝

This is a template project designed to be customized for your family tree. Feel free to:
- Add new features
- Improve the design
- Enhance the data structure
- Add export/import functionality

## License 📄

This project is open source and available under the MIT License.

---

**Family Tree Explorer** - Bringing families together through beautiful visualization 💫+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
