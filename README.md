# Luxe Store — Vite + React + Tailwind CSS

A fully responsive e-commerce mockup with storefront and admin portal.

## Tech Stack

- **Vite** — lightning-fast dev server and build tool
- **React 18** — component-based UI with hooks
- **Tailwind CSS v3** — utility-first styling
- **React Context** — global cart state management

## Project Structure

```
luxe-store/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx              # Entry point
    ├── App.jsx               # Root component + view router
    ├── index.css             # Tailwind directives
    ├── data/
    │   └── index.js          # Products, orders, customers data
    ├── context/
    │   └── CartContext.jsx   # Global cart state (useReducer)
    ├── components/
    │   ├── Navbar.jsx        # Top navigation bar
    │   ├── Footer.jsx        # Site footer
    │   └── StatusPill.jsx    # Shared status badge component
    └── pages/
        ├── StorePage.jsx     # Product listing + hero + filters
        ├── CartPage.jsx      # Cart with qty controls + summary
        ├── CheckoutPage.jsx  # Checkout form
        ├── SuccessPage.jsx   # Order confirmation
        ├── AdminPage.jsx     # Admin shell + sidebar
        └── admin/
            ├── Dashboard.jsx # Stats, charts, recent orders
            ├── Orders.jsx    # Searchable / filterable orders table
            ├── Products.jsx  # Product inventory management
            ├── Customers.jsx # Customer directory
            └── Settings.jsx  # Store config + toggles
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open in browser
# http://localhost:5173
```

## Build for Production

```bash
npm run build
npm run preview
```

## Features

### Storefront
- Hero banner with CTA
- Category filter chips (All / Tech / Fashion / Home / Beauty / Sports)
- Responsive product grid (2 → 3 → 4 columns)
- Add to cart with visual feedback
- Cart with quantity controls, remove, subtotal + tax + shipping
- Checkout form (contact, shipping, payment)
- Order confirmation with generated order ID

### Admin Portal
- **Dashboard** — revenue/order/customer KPIs, bar chart, donut chart, recent orders
- **Orders** — search + status filter, full orders table
- **Products** — search + category filter, inventory with low-stock highlighting
- **Customers** — searchable customer directory with avatars
- **Settings** — store config inputs, notification/payment/security toggles

### Responsive
- Mobile-first design throughout
- Admin sidebar collapses to horizontal tab bar on mobile
- All tables scroll horizontally on small screens
- Fluid typography and spacing
