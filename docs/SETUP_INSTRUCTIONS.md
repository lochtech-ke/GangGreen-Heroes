# GangGreen Platform - Setup Instructions

## Project Setup Complete! ✅

The project structure has been created with all necessary configuration files.

## Next Steps

Due to Windows path length limitations with Google Drive, please run the following command manually:

```bash
npm install
```

If you encounter path length issues, try one of these solutions:

### Option 1: Enable Long Paths in Windows
Run PowerShell as Administrator and execute:
```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

Then restart your terminal and run:
```bash
npm install
```

### Option 2: Move Project to Shorter Path
Move the project to a location with a shorter path, such as:
```
C:\Dev\GangGreen
```

### Option 3: Use pnpm (handles long paths better)
```bash
npm install -g pnpm
pnpm install
```

## After Installation

Once dependencies are installed, you can start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## What's Been Set Up

✅ React 18 with TypeScript
✅ Vite build tool
✅ Tailwind CSS for styling
✅ Supabase client configuration
✅ ESLint and Prettier for code quality
✅ Environment variables configuration
✅ Project directory structure
✅ Git repository initialized

## Environment Variables

The `.env` file has been created with Supabase credentials. You'll need to add:
- Antugrow API key
- Mapbox token (for maps)

## Project Structure

```
ganggreen-platform/
├── src/
│   ├── components/     # React components
│   ├── services/       # API services (Supabase, Antugrow)
│   ├── hooks/          # Custom React hooks
│   ├── contexts/       # React Context providers
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── contracts/      # Smart contracts (Solidity)
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── public/             # Static assets
├── .env                # Environment variables
└── package.json        # Dependencies
```

## Next Task

After running `npm install`, the next task will be:
**Task 2: Database Schema and Supabase Setup**

This will involve creating database tables and configuring Row Level Security policies.
