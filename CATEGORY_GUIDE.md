# Category Management Guide

## How Categories Work

Categories in Product Vibes help users discover products by organizing them into logical groups. Here's how the system works:

## 📍 **Where Categories Are Defined**

Categories are defined in `/src/data/categories.ts`:

```typescript
export const categoryConfig = [
  { 
    id: "Creative Tools", 
    name: "🎨 Creative Tools", 
    icon: "🎨", 
    color: "from-pink-500 to-purple-500"
  },
  // ... more categories
]
```

## 🔄 **Category Flow**

1. **User submits product** → Selects category from dropdown
2. **Product stored** → Category saved to database 
3. **User browses** → Can filter by category on homepage
4. **Category counts** → Automatically calculated from database

## ➕ **Adding New Categories**

To add a new category:

### 1. Update `categories.ts`:
```typescript
{ 
  id: "Music & Audio", 
  name: "🎵 Music & Audio", 
  icon: "🎵", 
  color: "from-indigo-500 to-purple-500"
}
```

### 2. The category will automatically:
- ✅ Appear in the product submission dropdown
- ✅ Show up in the homepage filter tabs
- ✅ Get live product counts from the database
- ✅ Work with all filtering logic

## 🎨 **Category Properties**

- **`id`**: Used as database value (should be descriptive)
- **`name`**: Display name with emoji (shown to users)
- **`icon`**: Emoji for visual identification
- **`color`**: Tailwind gradient for category badges

## 🎯 **Best Practices**

1. **Keep categories broad** - Too specific = empty categories
2. **Use descriptive IDs** - Avoid abbreviations
3. **Choose meaningful emojis** - Visual recognition is important
4. **Test color contrast** - Ensure readability
5. **Consider user mental models** - Categories should feel natural

## 🚀 **Current Categories**

- 🎨 Creative Tools
- 🚀 Productivity  
- 🎮 Fun & Games
- 🛠️ Developer Tools
- 💡 AI-Powered
- 🌱 Side Projects
- 🛒 E-commerce
- 💪 Health & Fitness
- 📚 Education

## 🔧 **Advanced: Dynamic Categories**

For future enhancement, you could make categories dynamic by:
1. Storing them in the database
2. Creating an admin interface
3. Allowing community-suggested categories

But for now, the config file approach is perfect for most use cases!
