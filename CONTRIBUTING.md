# 🤝 Contributing to Whack-a-Mole

Thank you for your interest in contributing to the Whack-a-Mole game! This document provides guidelines for contributing to this project.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/whack-a-mole.git
   cd whack-a-mole
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Open the game** in your browser:
   ```bash
   # Simply open index.html in your browser
   # Or use a local server like Live Server in VS Code
   ```

## 🎯 How to Contribute

### 🐛 Reporting Bugs
- Use the GitHub issue tracker
- Include steps to reproduce the bug
- Include browser/device information
- Add screenshots if helpful

### 💡 Suggesting Features
- Check existing issues first
- Describe the feature clearly
- Explain why it would be useful
- Consider accessibility and mobile users

### 🔧 Making Changes

#### 1. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

#### 2. Make Your Changes
- Follow the existing code style
- Test on multiple devices/browsers
- Ensure accessibility compliance
- Add comments for complex logic

#### 3. Test Your Changes
- Test all game functionality
- Test on mobile devices
- Test both light and dark themes
- Test with sound on/off
- Verify responsive design

#### 4. Commit Your Changes
Use conventional commit messages:
```bash
git commit -m "feat: add new difficulty levels"
git commit -m "fix: resolve mobile touch issue"
git commit -m "docs: update README with new features"
```

#### 5. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
```
Then create a pull request on GitHub.

## 🎨 Code Style Guidelines

### HTML
- Use semantic HTML elements
- Include proper accessibility attributes
- Keep structure clean and organized

### CSS
- Use CSS variables for theming
- Follow mobile-first approach
- Use rem/em units for responsive design
- Group related properties together
- Add comments for complex styles

### JavaScript
- Use descriptive variable names
- Add comments for complex logic
- Handle errors gracefully
- Use modern ES6+ features appropriately
- Keep functions focused and small

## 📱 Testing Guidelines

### Required Testing
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Android Chrome
- **Features**: All buttons, animations, sounds, themes
- **Responsive**: Test different screen sizes
- **Accessibility**: Keyboard navigation, screen readers

### Testing Checklist
- [ ] Game starts and plays correctly
- [ ] All buttons work (start, pause, restart, etc.)
- [ ] Theme toggle works in both directions
- [ ] Sound toggle works correctly
- [ ] Animations are smooth
- [ ] Mobile touch works properly
- [ ] Responsive design looks good
- [ ] High score persists across sessions

## 🎯 Good First Issues

Perfect for new contributors:
- **UI Improvements**: Better button styles, icons, layouts
- **Sound Effects**: Add more audio files or effects
- **Animations**: New visual effects or transitions
- **Documentation**: Improve README, add code comments
- **Accessibility**: ARIA labels, keyboard support
- **Testing**: Add unit tests or fix browser compatibility

## 🚀 Advanced Contributions

For experienced developers:
- **Performance**: Optimize animations or audio
- **PWA Features**: Service workers, offline support  
- **Game Mechanics**: New difficulty levels, power-ups
- **Build Tools**: Webpack, bundling, optimization
- **Testing Framework**: Jest tests, E2E testing

## 🎨 Design Guidelines

### Visual Design
- Maintain clean, modern aesthetic
- Ensure good contrast ratios (4.5:1 minimum)
- Use consistent spacing and typography
- Support both light and dark themes

### User Experience
- Keep interactions intuitive
- Provide clear visual feedback
- Ensure mobile-friendly touch targets (44px minimum)
- Maintain performance on lower-end devices

## 🔍 Review Process

### Pull Request Requirements
- Clear description of changes
- Screenshots/videos for UI changes
- Testing evidence (which devices/browsers)
- No breaking changes without discussion

### Review Criteria
- Code quality and organization
- Browser compatibility
- Mobile responsiveness  
- Accessibility compliance
- Performance impact
- Documentation updates

## 🎯 Priority Areas

We're especially looking for contributions in:
1. **Accessibility improvements**
2. **Mobile optimization**  
3. **Performance enhancements**
4. **New game features**
5. **Testing and documentation**

## 💬 Getting Help

- **Questions**: Open a GitHub issue with the "question" label
- **Discussions**: Use GitHub Discussions for broader topics
- **Code Review**: Tag maintainers for review help

## 📝 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Every contribution, no matter how small, makes this project better for everyone. We appreciate:
- Bug reports and feature requests
- Code contributions and improvements  
- Documentation and examples
- Testing and feedback
- Spreading the word about the project

Happy coding! 🎮✨