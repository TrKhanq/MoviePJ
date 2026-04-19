# GitHub Pages Deployment Guide

## Quick Start

1. **Push to GitHub**
   ```bash
   git add docs/
   git commit -m "Add responsive design and GitHub Pages setup"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click **Settings** tab
   - Scroll down to **Pages** section
   - Under **Build and deployment**, select **Deploy from a branch**
   - Choose **main** branch and **docs** folder
   - Click **Save**

3. **Visit Your Site**
   - Your site will be available at: `https://[username].github.io/[repository-name]/`
   - It may take a few minutes to deploy initially

## Features Included

### Responsive Design
- **Mobile First**: Optimized for all screen sizes
- **Breakpoints**: 576px, 768px, 992px, 1200px
- **Touch Friendly**: Optimized for mobile interactions
- **Flexible Grid**: Adapts from 1-4 columns

### Pages
- **Homepage** (`index.html`): Movie listings and promotions
- **Login** (`login.html`): User authentication
- **Register** (`register.html`): New user registration
- **Booking** (`booking.html`): Ticket reservation system
- **Admin** (`admin.html`): Administrative dashboard
- **Test** (`test-responsive.html`): Responsive design testing

### Technologies
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Grid/Flexbox
- **JavaScript ES6+**: Interactive functionality
- **LocalStorage**: Data persistence
- **Google Fonts**: Typography

## Testing Your Site

### Local Testing
1. Open `docs/test-responsive.html` in your browser
2. Resize browser to test different breakpoints
3. Use browser dev tools to simulate devices

### Mobile Testing
- Test on actual mobile devices
- Check both portrait and landscape
- Verify touch interactions work

### Cross-Browser Testing
- Chrome, Firefox, Safari, Edge
- Test on different operating systems
- Verify accessibility features

## Customization

### Colors
Edit CSS variables in `css/index.css`:
```css
:root {
    --primary-red: #e50914;
    --bg-dark: #0e131d;
    --text-light: #ffffff;
}
```

### Fonts
Update Google Fonts links in HTML files:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Content
- Update movie data in `js/models/movies.js`
- Modify text content in HTML files
- Add new pages following the same structure

## Troubleshooting

### Common Issues

**404 Errors**
- Check file paths are relative (`./css/style.css`)
- Ensure all files are in the `docs` folder
- Verify GitHub Pages is enabled for `docs` folder

**Styles Not Loading**
- Check CSS file paths
- Verify `.nojekyll` file exists in `docs` folder
- Clear browser cache

**JavaScript Not Working**
- Check console for errors
- Verify JS file paths
- Check for syntax errors

**Responsive Issues**
- Test with `test-responsive.html`
- Check viewport meta tag
- Verify media queries in CSS

### GitHub Pages Tips

**Deployment Time**
- Initial deployment may take 2-10 minutes
- Subsequent updates are usually faster
- Check GitHub Actions for deployment status

**Custom Domain**
- Add `CNAME` file to `docs` folder for custom domain
- Configure DNS settings with your domain provider

**SSL Certificate**
- GitHub Pages provides free SSL
- Automatic HTTPS redirection
- No additional configuration needed

## Performance Optimization

### Images
- Use optimized image formats (WebP, AVIF)
- Implement lazy loading
- Add proper alt tags

### CSS/JS
- Minify files for production
- Use CSS/JS compression
- Implement caching strategies

### Loading Speed
- Optimize font loading
- Reduce HTTP requests
- Use CDN for external resources

## Maintenance

### Regular Updates
- Update movie listings
- Check for broken links
- Test on new devices/browsers

### Security
- Keep dependencies updated
- Monitor for vulnerabilities
- Use HTTPS only

### Analytics
- Add Google Analytics if needed
- Track user behavior
- Monitor performance metrics

## Support

For issues with:
- **GitHub Pages**: Check GitHub documentation
- **Responsive Design**: Use the test page
- **Functionality**: Check browser console for errors

Your responsive movie theater website is now ready for GitHub Pages deployment!
