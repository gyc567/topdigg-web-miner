# Bug Report

## Bug Summary
Language switcher dropdown displays hardcoded language labels instead of using internationalized text. When users switch to English or Japanese, the dropdown still shows language names in their native scripts rather than the appropriate localized labels.

## Bug Details

### Expected Behavior
- When the site language is set to English, the language switcher should display "English" for English option
- When the site language is set to Japanese, the language switcher should display "English" for English option and "Japanese" for Japanese option  
- Language labels should be internationalized and display according to the current site language context

### Actual Behavior  
- Language switcher always shows hardcoded native language names regardless of current site language:
  - English always shows as "English" (correct by coincidence)
  - Japanese always shows as "日本語" (should show "Japanese" when site is in English)
  - Chinese options always show as "中文(简)" and "中文(繁)" regardless of site language

### Steps to Reproduce
1. Open the website (defaults to Chinese based on geo-detection)
2. Click on the language switcher dropdown in the header
3. Observe that all language options show in their native scripts
4. Switch to English language
5. Click on the language switcher dropdown again  
6. Observe that Japanese still shows as "日本語" instead of "Japanese"
7. Switch to Japanese language
8. Click on the language switcher dropdown again
9. Observe that English still shows as "English" and Chinese options are still in Chinese characters

### Environment
- **Version**: Current development version
- **Platform**: Web browser (all browsers affected)
- **Configuration**: Multi-language React app with i18next, 4 supported locales (zh-Hans, zh-Hant, en, ja)

## Impact Assessment

### Severity
- [x] Medium - Feature impaired but workaround exists
- [ ] Critical - System unusable
- [ ] High - Major functionality broken  
- [ ] Low - Minor issue or cosmetic

### Affected Users
All users who switch between languages, particularly non-native speakers who may not recognize language names in foreign scripts.

### Affected Features
- Language switching functionality
- User experience and accessibility
- Internationalization consistency across the application

## Additional Context

### Error Messages
```
No JavaScript errors, but internationalization inconsistency exists
```

### Screenshots/Media
The LanguageSwitcher component in `/src/components/LanguageSwitcher.tsx` uses hardcoded labels object instead of internationalized text.

### Related Issues
This affects the overall i18n strategy and user experience. While functional, it creates inconsistency with the rest of the application's internationalization approach.

## Initial Analysis

### Suspected Root Cause
The `LanguageSwitcher` component uses a hardcoded `labels` object with native language names instead of utilizing the i18next translation system to provide localized language labels.

### Affected Components
- `/src/components/LanguageSwitcher.tsx` - Main component with hardcoded labels
- Translation files may need new translation keys for language names:
  - `/src/locales/zh-Hans/translation.json`
  - `/src/locales/zh-Hant/translation.json`  
  - `/src/locales/en/translation.json`
  - `/src/locales/ja/translation.json`

---
**Created**: $(date)
**Status**: Reported  
**Priority**: Medium
**Assignee**: TBD