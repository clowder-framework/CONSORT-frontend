# CONSORT Server with Drizzle ORM

This server uses Drizzle ORM with PostgreSQL to manage the CONSORT database schema.

## Setup

### 1. Environment Configuration

Copy the template environment file and configure your database settings:

```bash
cp .templateenv .env
```

Update the database configuration in `.env`:

```env
# Database Configuration
PGSERVER='localhost'
PGPORT=5432
PGUSER=postgres
PGPASSWORD=strong_password_here
PGDATABASE=consort
PGSSL=false
```

### 2. Database Setup

Make sure you have PostgreSQL running and create the database:

```sql
CREATE DATABASE consort;
```

### 3. Install Dependencies

If you need drizzle-kit for advanced features:

```bash
npm install drizzle-kit
```

### 4. Run Database Migration

Initialize the database with the schema:

```bash
npm run db:migrate
```

### 5. Test Database Connection

```bash
npm run db:test
```

### 6. Check Database Health

```bash
npm run db:health
```

## Usage

### Starting the Server

```bash
npm start
```

### Running Examples

To see the database operations in action:

```bash
npm run db:examples
```

### API Endpoints

The server provides the following API endpoints:

#### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:uuid` - Get user by UUID

#### Publications
- `GET /api/publications` - Get all publications with user info
- `POST /api/publications` - Create a new publication
- `GET /api/publications/:uuid` - Get publication by UUID
- `GET /api/publications/:uuid/annotations` - Get annotations for a publication

#### Annotations
- `POST /api/annotations` - Create a new annotation
- `PUT /api/annotations/:uuid` - Update an annotation

#### Feedback
- `POST /api/feedback` - Create feedback for an annotation
- `GET /api/annotations/:uuid/feedback` - Get feedback for an annotation

#### Health Check
- `GET /api/health` - Check database connection status

## Database Schema

The database schema includes the following tables:

- **users** - User information
- **publication** - Research publications/papers
- **section** - Document sections
- **sentence** - Individual sentences with coordinates
- **annotation** - ML annotations for sentences
- **annotationfeedback** - User feedback on annotations
- **statement_section** - CONSORT/SPIRIT statement sections
- **statement_topic** - CONSORT/SPIRIT statement topics

## File Structure

```
server/
├── db/
│   ├── schema.js         # Drizzle ORM schema definitions
│   ├── connection.js     # Database connection setup
│   ├── queries.js        # Common database queries
│   ├── migrate.js        # Database migration script
│   └── examples.js       # Usage examples
├── routes/
│   ├── api.js           # API routes using Drizzle ORM
│   ├── auth.js          # Authentication routes
│   └── index.js         # Main routes
├── drizzle.config.js    # Drizzle configuration
```

## Development

### Query Operations

Use the pre-built query functions from `db/queries.js`:

```javascript
const { userQueries, publicationQueries } = require('./db/queries');

// Create a user
const user = await userQueries.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'researcher'
});

// Get publications by user
const publications = await publicationQueries.getPublicationsByUser(userUuid);
```

### Direct Database Access

For custom queries, use the database instance:

```javascript
const { db } = require('./db/connection');
const { users } = require('./db/schema');
const { eq } = require('drizzle-orm');

const result = await db.select().from(users).where(eq(users.email, 'test@example.com'));
```

