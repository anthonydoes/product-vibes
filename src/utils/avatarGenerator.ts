// Fun avatar generation utilities

interface AvatarCategory {
  styles: string[];
  name: string;
}

export class AvatarGenerator {
  // Avatar categories with their corresponding styles
  private static readonly AVATAR_CATEGORIES: Record<string, AvatarCategory> = {
    people: {
      styles: ['avataaars', 'big-smile', 'open-peeps', 'personas', 'micah'],
      name: '👤 People'
    },
    things: {
      styles: ['bottts', 'shapes', 'identicon', 'rings', 'beam'],
      name: '🤖 Things'
    }
  };

  // Background colors for avatars
  private static readonly BACKGROUND_COLORS = [
    'ff6b6b', // Red
    '4ecdc4', // Teal
    '45b7d1', // Blue
    'f9ca24', // Yellow
    'f0932b', // Orange
    'eb4d4b', // Dark Red
    '6c5ce7', // Purple
    'a29bfe', // Light Purple
    'fd79a8', // Pink
    '00b894', // Green
    '0984e3', // Dark Blue
    'fdcb6e', // Light Orange
    '2ecc71', // Emerald
    'e74c3c', // Alizarin
    '9b59b6', // Amethyst
    'f39c12', // Orange
    '1abc9c', // Turquoise
    'e67e22', // Carrot
  ];

  // Special configurations for better variety
  private static readonly STYLE_CONFIGS = {
    'avataaars': {
      extraParams: {
        'accessories': ['wayfarers', 'sunglasses', 'prescription01', 'prescription02'],
        'top': ['shortHair', 'longHair', 'hat'],
        'hairColor': ['auburn', 'black', 'blonde', 'brown']
      }
    },
    'bottts': {
      extraParams: {
        'colors': ['blue', 'green', 'purple', 'orange', 'red', 'yellow'],
        'mood': ['happy', 'blissful', 'pleased']
      }
    },
    'shapes': {
      extraParams: {
        'colors': ['purple', 'blue', 'pink', 'green', 'orange', 'red', 'yellow']
      }
    },
    'identicon': {
      extraParams: {
        'colors': ['blue', 'green', 'purple', 'orange', 'red', 'yellow', 'pink']
      }
    },
    'rings': {
      extraParams: {
        'colors': ['blue', 'green', 'purple', 'orange', 'red', 'yellow', 'pink']
      }
    },
    'beam': {
      extraParams: {
        'colors': ['blue', 'green', 'purple', 'orange', 'red', 'yellow', 'pink']
      }
    },
    'open-peeps': {
      extraParams: {
        'mood': ['happy', 'surprised', 'blissful'],
        'hair': ['short', 'long', 'buzz']
      }
    },
    'personas': {
      extraParams: {
        'mood': ['happy', 'blissful', 'pleased']
      }
    },
    'big-smile': {
      extraParams: {
        'mood': ['happy', 'blissful', 'pleased']
      }
    },
    'micah': {
      extraParams: {
        'mood': ['happy', 'blissful', 'pleased']
      }
    }
  };

  /**
   * Generate a fun avatar URL based on user data
   * @param seed - Unique identifier (usually email or username)
   * @param style - Optional specific style to use
   * @param category - Optional category ('people', 'things')
   * @returns Avatar URL
   */
  static generateFunAvatar(seed: string, style?: string, category?: string): string {
    const selectedStyle = style || this.getRandomStyleFromCategory(seed, category);
    const backgroundColor = this.getRandomBackgroundColor(seed);
    
    // Base URL for DiceBear API
    const baseUrl = `https://api.dicebear.com/7.x/${selectedStyle}/svg`;
    
    // Add parameters for customization
    const params = new URLSearchParams({
      seed: seed,
      backgroundColor: backgroundColor,
      size: '200',
      // Add format specification to ensure proper SVG response
      format: 'svg'
    });

    // Add style-specific customizations
    this.addStyleSpecificParams(params, selectedStyle, seed);

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Get a consistent random style from a specific category or all styles
   */
  private static getRandomStyleFromCategory(seed: string, category?: string): string {
    if (category && this.AVATAR_CATEGORIES[category]) {
      const categoryStyles = this.AVATAR_CATEGORIES[category].styles;
      const hash = this.hashCode(seed + category);
      return categoryStyles[Math.abs(hash) % categoryStyles.length];
    }
    
    // If no category specified, pick from all styles
    const allStyles = Object.values(this.AVATAR_CATEGORIES).flatMap(cat => cat.styles);
    const hash = this.hashCode(seed);
    return allStyles[Math.abs(hash) % allStyles.length];
  }

  /**
   * Add style-specific parameters for better customization
   */
  private static addStyleSpecificParams(params: URLSearchParams, style: string, seed: string): void {
    const config = this.STYLE_CONFIGS[style as keyof typeof this.STYLE_CONFIGS];
    
    if (config?.extraParams) {
      Object.entries(config.extraParams).forEach(([key, values]) => {
        params.append(`${key}[]`, this.getRandomFromArray(values as string[], seed + key));
      });
    }
  }

  /**
   * Get a consistent random background color based on seed
   */
  private static getRandomBackgroundColor(seed: string): string {
    const hash = this.hashCode(seed + 'bg');
    return this.BACKGROUND_COLORS[Math.abs(hash) % this.BACKGROUND_COLORS.length];
  }

  /**
   * Get a random item from array based on seed
   */
  private static getRandomFromArray<T>(array: T[], seed: string): T {
    const hash = this.hashCode(seed);
    return array[Math.abs(hash) % array.length];
  }

  /**
   * Simple hash function for consistent randomness
   */
  private static hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  /**
   * Generate multiple avatar options for user to choose from
   * @param seed - Unique identifier
   * @param count - Number of avatars per category (default 3)
   * @returns Object with categorized avatar options
   */
  static generateCategorizedAvatarOptions(seed: string, count: number = 6): Record<string, { name: string; avatars: string[] }> {
    const result: Record<string, { name: string; avatars: string[] }> = {};
    
    Object.entries(this.AVATAR_CATEGORIES).forEach(([categoryKey, categoryData]) => {
      const avatars: string[] = [];
      
      // Generate more varied seeds to avoid duplicates and loading issues
      for (let i = 0; i < count; i++) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const styleSeed = `${seed}-${categoryKey}-${i}-${timestamp}-${random}`;
        const avatar = this.generateFunAvatar(styleSeed, undefined, categoryKey);
        avatars.push(avatar);
      }
      
      result[categoryKey] = {
        name: categoryData.name,
        avatars
      };
    });
    
    return result;
  }

  /**
   * Generate multiple avatar options for user to choose from (legacy method)
   */
  static generateAvatarOptions(seed: string, count: number = 4): string[] {
    const options: string[] = [];
    const allStyles = Object.values(this.AVATAR_CATEGORIES).flatMap(cat => cat.styles);
    const selectedStyles = allStyles.slice(0, count);
    
    selectedStyles.forEach((style, index) => {
      options.push(this.generateFunAvatar(seed + index.toString(), style));
    });

    return options;
  }

  /**
   * Get available categories
   */
  static getCategories(): Record<string, string> {
    const categories: Record<string, string> = {};
    Object.entries(this.AVATAR_CATEGORIES).forEach(([key, data]) => {
      categories[key] = data.name;
    });
    return categories;
  }

  /**
   * Generate avatars for a specific category
   */
  static generateCategoryAvatars(seed: string, category: string, count: number = 6): string[] {
    const categoryData = this.AVATAR_CATEGORIES[category];
    if (!categoryData) return [];
    
    const avatars: string[] = [];
    
    // Generate varied avatars for the category
    for (let i = 0; i < count; i++) {
      const styleSeed = seed + category + i.toString();
      avatars.push(this.generateFunAvatar(styleSeed, undefined, category));
    }
    
    return avatars;
  }
}
