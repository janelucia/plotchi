# Plant Tamagotchi - Plant Care Reminder App

A modern web application for tracking and caring for your plants. Built with Nuxt 3, Prisma, and SQLite.

## Features

- 🌱 **Plant Management**: Add, edit, and track multiple plants
- 💧 **Watering Reminders**: Automated scheduling based on plant needs
- 📸 **Photo Gallery**: Capture and store plant photos with camera integration
- 📊 **Care History**: Track watering history and plant health
- 🎨 **Modern UI**: Beautiful interface built with DaisyUI and Tailwind CSS
- 👤 **User System**: Multi-user support with demo user for development

## Tech Stack

- **Frontend**: Nuxt 3, Vue 3 (Composition API), TypeScript
- **Backend**: Nuxt Server API, Prisma ORM
- **Database**: SQLite (development), easily configurable for production
- **Styling**: Tailwind CSS, DaisyUI components
- **Icons**: Nuxt Icon with Material Design Icons
- **Runtime**: Bun (recommended) or Node.js

## Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Git

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd plant-tamagotchi
bun install
```

### 2. Environment Setup

Copy the environment file and configure if needed:

```bash
cp .env.example .env
```

The default configuration uses SQLite with the database at `server/prisma/dev.db`.

### 3. Database Setup

Initialize and seed the database:

```bash
# Generate Prisma client
bun prisma generate --schema=server/prisma/schema.prisma

# Create database and run migrations
bun prisma migrate dev --schema=server/prisma/schema.prisma

# Seed with sample data (optional)
bun run db:seed
```

### 4. Start Development Server

```bash
bun run dev
```

The app will be available at `http://localhost:3000`.

## Database Management

### Working with Prisma

All database operations should be run with the correct schema path since Prisma is located in `server/prisma/`:

```bash
# Generate client after schema changes
bun prisma generate --schema=server/prisma/schema.prisma

# Create new migration
bun prisma migrate dev --schema=server/prisma/schema.prisma --name "your-migration-name"

# Reset database (⚠️ destroys all data)
bun prisma migrate reset --schema=server/prisma/schema.prisma

# View database in Prisma Studio
bun prisma studio --schema=server/prisma/schema.prisma

# Deploy to production
bun prisma migrate deploy --schema=server/prisma/schema.prisma
```

### Database Schema

The application uses these main models:

- **User**: User accounts (currently demo user only)
- **Plant**: Plant information and care settings
- **PlantPhoto**: Photo gallery for each plant
- **WateringHistory**: Track when plants were watered

### Seeding Data

The seed script creates sample plants with various watering schedules and statuses:

```bash
bun run db:seed
```

This creates:

- Demo user account
- 8 sample plants with realistic data
- Watering history entries
- Various plant statuses (overdue, okay, never watered)

## Project Structure

```
├── app/                          # Nuxt application
│   ├── components/              # Vue components
│   │   ├── ui/                 # Reusable UI components
│   │   ├── AppHeader.vue       # Main navigation
│   │   └── PlantCard.vue       # Plant display card
│   ├── pages/                  # Route pages
│   │   ├── index.vue          # Dashboard
│   │   ├── plant/[id].vue     # Plant detail page
│   │   └── plants/new.vue     # Add plant flow
│   └── types/                  # TypeScript definitions
├── server/                      # Server-side code
│   ├── api/                    # API endpoints
│   │   ├── plants/            # Plant CRUD operations
│   │   └── upload/            # File upload handling
│   ├── prisma/                # Database
│   │   ├── schema.prisma      # Database schema
│   │   ├── migrations/        # Database migrations
│   │   └── seed.ts           # Sample data
│   └── utils/                 # Server utilities
├── public/                     # Static assets
│   └── uploads/               # User uploaded files
└── components/                # Global components
    └── ui/                    # Additional UI components
```

## Key Features & Usage

### Adding Plants

1. Navigate to the home page
2. Click "Add Plant" or the + button
3. Follow the 5-step onboarding:
   - Welcome & plant name
   - Plant species (optional)
   - Watering frequency
   - Photo capture (optional)
   - Review and confirm

### Plant Photography

- **Camera Integration**: Use device camera with front/back switching
- **Photo Gallery**: View all photos for each plant
- **Profile Photos**: Set any photo as the plant's profile image
- **Upload Support**: Both camera capture and file upload

### Watering Management

- **Smart Status**: Plants show overdue/okay status based on last watering
- **History Tracking**: Record each watering with optional notes and photos
- **Flexible Schedules**: Custom watering frequency from daily to monthly

## API Endpoints

### Plants

- `GET /api/plants` - List all plants
- `POST /api/plants` - Create new plant
- `GET /api/plants/[id]` - Get plant details
- `PUT /api/plants/[id]` - Update plant
- `DELETE /api/plants/[id]` - Delete plant
- `POST /api/plants/[id]/water` - Record watering

### Photos

- `GET /api/plants/[id]/photos` - Get plant photos
- `POST /api/plants/[id]/photos` - Add plant photo
- `POST /api/upload` - Upload file

## Development Scripts

```bash
# Development
bun run dev              # Start dev server
bun run build            # Build for production
bun run preview          # Preview production build

# Database
bun run db:seed          # Seed database with sample data
bun prisma studio        # Open database GUI (with --schema flag)
bun prisma migrate dev   # Create and apply migration

# Code Quality
bun run typecheck        # Type checking (if configured)
bun run lint             # Linting (if configured)
```

## Environment Variables

```bash
# Database
DATABASE_URL="file:./dev.db"    # SQLite database path (relative to prisma folder)

# File Upload (optional)
UPLOAD_MAX_SIZE=5242880         # Max file size in bytes (5MB default)
UPLOAD_ALLOWED_TYPES="image/jpeg,image/png,image/webp"
```

## Deployment

### Database Migration

For production deployment:

1. Set `DATABASE_URL` to your production database
2. Run migrations: `bun prisma migrate deploy --schema=server/prisma/schema.prisma`
3. Build the application: `bun run build`

### File Uploads

Configure file storage for production:

- Local: Ensure `public/uploads/` is writable
- Cloud: Implement cloud storage in `server/api/upload/index.post.ts`

## Troubleshooting

### Common Issues

**Database Connection Errors**

```bash
# Regenerate Prisma client
bun prisma generate --schema=server/prisma/schema.prisma

# Ensure database exists
bun prisma migrate dev --schema=server/prisma/schema.prisma
```

**Import Path Issues**

- Server API files use relative imports: `../../utils/prisma`
- App components use Nuxt aliases: `~/components/...`

**Photo Upload Issues**

- Check `public/uploads/` directory exists and is writable
- Verify file size limits in upload API

### Development Tips

1. **Database Changes**: Always create migrations for schema changes
2. **File Structure**: Keep server code in `server/`, app code in `app/`
3. **Component Organization**: Use `components/ui/` for reusable components
4. **TypeScript**: Define interfaces in `types/` directories
5. **Camera Modal**: Existing `CameraModal.vue` handles all camera operations

## Contributing

1. Create feature branch
2. Make changes with proper TypeScript types
3. Test database migrations work both ways
4. Update documentation if needed
5. Submit pull request

## License

[Your chosen license]
