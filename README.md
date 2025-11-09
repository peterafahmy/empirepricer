# Empire Travel Itinerary Pricer

A comprehensive web application for travel agencies to create, price, and export detailed travel itineraries for clients.

## Features

### Core Functionality
- **Itinerary Builder**: Create, view, edit, duplicate, and delete itineraries
- **Traveler Management**: Add travelers with room assignments (single, double, twin, triple, family)
- **Dynamic Pricing**: Automatic calculation with supplements, discounts, and taxes
- **Service Management**: Add accommodations, transfers, tours, and miscellaneous services
- **PDF Export**: Generate professional itinerary proposals
- **Admin Dashboard**: Configure pricing rules and manage templates

### Pricing Features
- Per-person, per-room, and per-group pricing options
- Single room supplement (flat + percentage)
- Triple room discount (flat + percentage)
- Child discounts based on age
- Automatic tax calculations
- Real-time pricing updates

### User Management
- Role-based access (Admin/Agent)
- Secure authentication with NextAuth.js
- Session management

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF
- **UI Components**: Custom components with Lucide icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd empirepricer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# .env file is already created with default values
# Update NEXTAUTH_SECRET for production
```

4. Initialize the database:
```bash
npx prisma db push
```

5. Seed the database with sample data:
```bash
npm run db:seed
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Login Credentials

**Admin Account:**
- Email: admin@empiretravel.com
- Password: admin123

**Agent Account:**
- Email: agent@empiretravel.com
- Password: agent123

## Usage Guide

### Creating an Itinerary

1. Log in with your credentials
2. Click "New Itinerary" on the dashboard
3. Fill in the basic information:
   - Title
   - Customer name
   - Travel dates
   - Currency
   - Notes and terms

### Adding Travelers

1. Open an itinerary
2. Click "Add Traveler" in the Travelers section
3. Enter traveler details:
   - Name
   - Age (optional)
   - Room type
   - Room number
   - Single occupancy option

### Adding Services

1. In the Services section, click "Add Service"
2. Select service type (Accommodation, Transfer, Tour, Miscellaneous)
3. Configure pricing:
   - Pricing type (per person/room/group)
   - Base price
   - Quantity
   - Tax rate
   - Discount
   - Supplier cost (internal only)

### Viewing Pricing

- The Pricing Summary panel updates in real-time
- Shows subtotal, supplements, discounts, taxes, and total
- Displays per-person pricing
- Includes detailed breakdown by service

### Generating PDF

1. Click "Export PDF" on the itinerary page
2. PDF includes:
   - Company branding
   - Customer details
   - Traveler list with room assignments
   - Complete service breakdown
   - Pricing summary
   - Terms & conditions

### Admin Functions

Admins can access the Admin Dashboard to configure:
- Single supplement rates
- Triple room discounts
- Child discount rules
- Default tax rates

## Database Schema

### Main Tables

- **User**: Agent and admin accounts
- **Itinerary**: Travel itinerary details
- **Traveler**: Travelers assigned to itineraries
- **Service**: Services included in itineraries
- **AccommodationTemplate**: Pre-configured accommodation options
- **TransferTemplate**: Pre-configured transfer options
- **TourTemplate**: Pre-configured tour options
- **PricingRule**: Global pricing rules and defaults

## API Endpoints

### Itineraries
- `GET /api/itineraries` - List all itineraries
- `POST /api/itineraries` - Create itinerary
- `GET /api/itineraries/[id]` - Get single itinerary
- `PATCH /api/itineraries/[id]` - Update itinerary
- `DELETE /api/itineraries/[id]` - Delete itinerary
- `POST /api/itineraries/[id]/duplicate` - Duplicate itinerary

### Travelers
- `POST /api/itineraries/[id]/travelers` - Add traveler
- `PATCH /api/travelers/[id]` - Update traveler
- `DELETE /api/travelers/[id]` - Delete traveler

### Services
- `POST /api/itineraries/[id]/services` - Add service
- `PATCH /api/services/[id]` - Update service
- `DELETE /api/services/[id]` - Delete service

### Templates
- `GET /api/templates/accommodations` - List accommodation templates
- `GET /api/templates/transfers` - List transfer templates
- `GET /api/templates/tours` - List tour templates

### Admin
- `GET /api/pricing-rules` - Get pricing rules
- `PATCH /api/pricing-rules` - Update pricing rules (admin only)

## Pricing Calculation Logic

The pricing engine (`lib/pricing.ts`) calculates totals based on:

1. **Base Amount**: Calculated per pricing type
   - Per Person: `basePrice × travelers × quantity`
   - Per Room: `basePrice × rooms × quantity`
   - Per Group: `basePrice × quantity`

2. **Supplements**: Applied to single occupancy rooms
   - `singleSupplementFlat + (basePrice × singleSupplementPercent / 100)`

3. **Discounts**:
   - Triple rooms: `tripleDiscountFlat + (basePrice × tripleDiscountPercent / 100)`
   - Children: `basePrice × childDiscountPercent / 100`
   - Service-specific discount percentage

4. **Taxes**: Applied to (base + supplements - discounts)
   - `taxableAmount × taxRate / 100`

## Development

### Database Management

View database in Prisma Studio:
```bash
npm run db:studio
```

Push schema changes:
```bash
npx prisma db push
```

Generate Prisma Client:
```bash
npx prisma generate
```

### Building for Production

```bash
npm run build
npm start
```

## Security Notes

- Change `NEXTAUTH_SECRET` in production
- Passwords are hashed with bcrypt
- Role-based access control enforced
- API routes protected with session checks
- Users can only access their own itineraries

## Future Enhancements

- Multi-currency support with real-time conversion
- Customer portal with e-signature
- Email notifications
- Template management UI in admin panel
- Version tracking for itineraries
- CRM integration (HubSpot, Notion)
- Bulk operations
- Advanced reporting and analytics
- Customer database
- Booking confirmation workflows

## License

Proprietary - Empire Travel

## Support

For questions or issues, please contact the development team.
