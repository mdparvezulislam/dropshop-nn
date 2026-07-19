# 05 - Tech Stack Details

## Core Platform

- **Next.js 16 (Latest)**: Built using React 19 server components and actions.
- **React 19**: Modern features like Server Actions and built-in hooks.
- **TypeScript**: Complete type-safety across client and server layers.
- **pnpm**: Fast, disk-efficient package manager.

## State & Styling

- **Tailwind CSS v4**: Utility-first CSS framework configured directly inside `globals.css` with CSS variables.
- **shadcn/ui**: Components customized using CSS custom variables matching our design system.
- **Framer Motion**: Production-grade animation library to implement smooth micro-interactions.

## Database & Cache

- **Mongoose / MongoDB**: Object Data Modeling (ODM) framework supporting schema structures and transactional queries.
- **ioredis**: Ultra-fast, robust Redis client supporting connection pooling, pipelining, and pub/sub.

## Background Jobs & File Storage

- **BullMQ**: Powerful queue processing engine built on Redis. Used to orchestrate heavy computations and external API calls asynchronously.
- **ImageKit**: Cloud media optimization and content delivery network (CDN) to handle asset resizing and serving.

## Forms & Validation

- **React Hook Form**: Performant, flexible form validation framework.
- **Zod**: Type-safe schema declarations and runtime verification.
