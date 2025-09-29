# Pokémon Team Builder

## Overview

A full-featured Pokémon team building and tracking application with AI-powered suggestions, built with React, TypeScript, and Vercel. Features include:

- Detailed Pokémon statistics and move sets
- Team composition analysis
- Trainer sheet management
- AI-powered team recommendations
- Pokedex integration

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **AI Integration**: Gemini API
- **Deployment**: Vercel
- **State Management**: Context API

## Prerequisites

- Node.js (v18.x or higher)
- npm or yarn
- Gemini API key

## Setup Instructions

1. Clone the repository

```bash
git clone https://github.com/antonydp/pokerole.git
```

2. Install dependencies

```bash
npm install
```

3. Create environment configuration

```bash
cp .env.example .env.local
```

4. Add your Gemini API key to `.env.local`:

```env
GEMINI_API_KEY=your_api_key_here
```

## Running the App

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
├── components/         # Reusable UI components
├── services/           # API integrations
├── api/                # Serverless functions
├── utils/              # Utility functions
└── types/              # TypeScript interfaces
```

## Deployment

This project is configured for Vercel deployment. Use the Vercel CLI or GitHub integration for production deployment.

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a pull request
