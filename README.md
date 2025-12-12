# Lunotes by Lunetix

A beautiful, simple, and powerful note-taking app built with React and TypeScript. Inspired by iOS Notes with modern web technologies.

## ✨ Features

- 📝 **Rich Text Editor** - Full-featured editor with headings, formatting, lists
- 🏷️ **Categories & Tags** - Organize notes with custom categories and tags
- 🔍 **Smart Search** - Search through notes, categories, and tags
- 📱 **Mobile First** - Responsive design that works perfectly on all devices
- 💾 **Auto Save** - Your notes are automatically saved to local storage
- 🎨 **Beautiful UI** - Clean, modern interface with smooth animations
- ⚡ **PWA Ready** - Install as an app on your device
- 🌙 **Category Management** - Create, edit, and delete custom categories
- 🏃‍♂️ **Fast & Lightweight** - Built with Vite for optimal performance

## 🚀 Live Demo

[Try Lunotes Now](https://your-demo-link.vercel.app)

## 📱 Screenshots

### Desktop View
![Desktop Screenshot](screenshots/desktop.png)

### Mobile View
![Mobile Screenshot](screenshots/mobile.png)

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Editor**: Tiptap (Rich Text Editor)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Build Tool**: Vite
- **PWA**: Vite PWA Plugin

## 🏃‍♂️ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/HilmiKhaidar/Lunotes_.git
   cd Lunotes_
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📋 Usage

### Creating Notes
- Click the **+** button to create a new note
- Use the rich text editor to format your content
- Notes are automatically saved as you type

### Managing Categories
- Create custom categories with icons and colors
- Edit or delete categories (except default ones)
- Filter notes by category

### Using Tags
- Add tags to organize notes further
- Click on tags to filter notes
- Tags are automatically suggested as you type

### Search & Filter
- Use the search bar to find notes quickly
- Filter by categories and tags
- Search works across note titles and content

## 🎨 Customization

### Adding New Icons
Edit `src/IconSelector.tsx` to add more icons from Lucide React:

```typescript
const iconOptions = [
  // Add your new icons here
  { name: 'YourIcon', component: YourIcon }
]
```

### Styling
The app uses Tailwind CSS. Customize colors and styles in:
- `tailwind.config.js` - Theme configuration
- `src/index.css` - Global styles and editor styles

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Hilmi Khaidar** - [GitHub](https://github.com/HilmiKhaidar)

## 🙏 Acknowledgments

- Inspired by iOS Notes app
- Built with amazing open-source libraries
- Icons by [Lucide](https://lucide.dev/)
- Fonts by [Google Fonts](https://fonts.google.com/)

---

Made with ❤️ by Lunetix
