# Holy Culture Radio

The official Holy Culture Radio iOS app - Your destination for Christian music, devotionals, podcasts, and community.

## Features

### Live Radio
- Stream Holy Culture Radio live from SiriusXM Channel 154
- View current show information and schedule
- 24/7 access to Christian Hip-Hop, Gospel, R&B, and inspirational music

### Daily Devotionals
- Read and share daily devotionals from community members
- Scripture-based content for spiritual growth
- Like, comment, and save your favorite devotionals
- Submit your own devotionals to share with the community

### Podcasts
- Browse and listen to Holy Culture podcasts
- Subscribe to your favorite shows
- Offline download support
- Variable playback speed
- Episode progress tracking

### Music (Spotify Integration)
- Connect your Spotify account for seamless music streaming
- Curated playlists by Holy Culture Radio DJs
- Browse by genre, mood, or artist
- Full playback controls within the app

### Community Forum
- Connect with fellow believers
- Prayer request sharing
- Testimonies and encouragement
- Bible study discussions
- Moderated categories for focused conversations

## Tech Stack

- **Framework**: React Native 0.73+
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **State Management**: React Hooks
- **Audio**: react-native-track-player
- **Music Integration**: Spotify SDK
- **Platform**: iOS (Apple App Store)

## Theme

Holy Culture Radio's signature red and black color scheme:
- Primary Red: `#C41E3A`
- Primary Black: `#1A1A1A`
- Background: `#0D0D0D`

## Project Structure

```
HolyCultureRadio/
├── App.tsx                 # Main app entry point
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── MiniPlayer.tsx
│   │   └── TabBarIcon.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── usePlayer.ts
│   ├── navigation/         # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/            # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── RadioScreen.tsx
│   │   ├── DevotionalsScreen.tsx
│   │   ├── DevotionalDetailScreen.tsx
│   │   ├── PodcastsScreen.tsx
│   │   ├── PodcastPlayerScreen.tsx
│   │   ├── MusicScreen.tsx
│   │   ├── ForumScreen.tsx
│   │   ├── ForumPostScreen.tsx
│   │   ├── CreatePostScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/           # API and external services
│   │   ├── api.ts
│   │   └── spotify.ts
│   ├── theme/              # Styling and theming
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   └── types/              # TypeScript type definitions
│       └── index.ts
├── ios/                    # iOS native code
├── package.json
├── tsconfig.json
└── app.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- Xcode 15+
- CocoaPods
- iOS Simulator or physical device

### Installation

1. Clone the repository:
```bash
git clone https://github.com/KvngNii/HolyCultureRadio.git
cd HolyCultureRadio
```

2. Install dependencies:
```bash
npm install
```

3. Install iOS pods:
```bash
cd ios && pod install && cd ..
```

4. Configure environment variables:
   - Set up Spotify API credentials
   - Configure SiriusXM integration keys

5. Run the app:
```bash
npm run ios
```

## Configuration

### Spotify Integration

To enable Spotify features:
1. Create a Spotify Developer account
2. Register your app at https://developer.spotify.com
3. Add your Client ID to `src/services/spotify.ts`
4. Configure redirect URIs in your Spotify dashboard

### SiriusXM Integration

SiriusXM streaming requires a valid subscription. Users will be prompted to authenticate with their SiriusXM credentials.

## App Store Deployment

### Requirements
- Apple Developer Program membership
- App Store Connect account
- Provisioning profiles and certificates

### Build for Release
```bash
npm run ios -- --configuration Release
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary software owned by Holy Culture Radio.

## Contact

Holy Culture Radio
- Website: https://holycultureradio.com
- SiriusXM: Channel 154
- Twitter: @HolyCultureRadio
- Instagram: @HolyCultureRadio

---

Built with faith and dedication for the Holy Culture community.
