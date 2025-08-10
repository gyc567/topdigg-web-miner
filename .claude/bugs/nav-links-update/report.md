# Bug Report

## Bug Summary
Navigation header contains placeholder links instead of actual business websites. The "My Site A" and "My Site B" links in the top-right navigation point to generic example.com URLs rather than the intended business websites.

## Bug Details

### Expected Behavior
- The navigation should display links to actual business websites:
  1. **SmartWallet Navigation Website** (聪明钱导航网站) → https://www.smartwallex.com/
  2. **Keyword Golden Ratio (KGR) Tool Website** → https://www.kgrcalculator.com/

### Actual Behavior  
- Navigation currently shows placeholder links:
  1. "My Site A" / "我的网站A" → https://example.com (placeholder)
  2. "My Site B" / "我的网站B" → https://example.org (placeholder)

### Steps to Reproduce
1. Open the website
2. Look at the top-right navigation area
3. Observe the two external site links next to the language switcher
4. Note they show generic placeholder names and link to example.com domains

### Environment
- **Version**: Current development version
- **Platform**: Web browser (all browsers affected)
- **Configuration**: Multi-language React app with site configuration in `/src/config/site.ts`

## Impact Assessment

### Severity
- [x] Medium - Feature impaired but workaround exists
- [ ] Critical - System unusable
- [ ] High - Major functionality broken  
- [ ] Low - Minor issue or cosmetic

### Affected Users
All users who might want to visit the related business websites. This affects brand presentation and user experience.

### Affected Features
- **Navigation functionality**: Links work but go to wrong destinations
- **Brand presentation**: Shows placeholder content instead of actual business links
- **User experience**: Users cannot access intended business websites
- **Internationalization**: All language versions show placeholder text

## Additional Context

### Error Messages
```
No JavaScript errors, but content shows placeholder information instead of actual business data
```

### Screenshots/Media
The navigation links are located in the SiteHeader component and use the `siteConfig.nav.mySites` configuration.

### Related Issues
This is likely a configuration update that was missed when transitioning from development placeholders to production content.

## Initial Analysis

### Suspected Root Cause
The `siteConfig.nav.mySites` array in `/src/config/site.ts` still contains placeholder development data instead of the actual business website information.

### Affected Components
- **File**: `/src/config/site.ts`
  - **Lines**: ~85-105 (mySites configuration)
  - **Issue**: Contains placeholder labels and URLs instead of actual business data

- **Display Component**: `/src/components/layout/SiteHeader.tsx` 
  - **Function**: Navigation rendering logic
  - **Issue**: Correctly displays the data, but data source contains placeholder content

### Required Updates

**Link 1: SmartWallet Navigation**
- **Current**: "我的网站A" / "My Site A" → https://example.com
- **Update to**: "聪明钱导航网站" / "Smart Money Navigation" → https://www.smartwallex.com/

**Link 2: KGR Tool**  
- **Current**: "我的网站B" / "My Site B" → https://example.org
- **Update to**: "KGR工具网站" / "KGR Tool Website" → https://www.kgrcalculator.com/

---
**Created**: 2025-08-10  
**Status**: Reported  
**Priority**: Medium  
**Type**: Configuration Update