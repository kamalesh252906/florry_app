# Product Requirement Document (PRD) - Florry

## 1. Project Overview
**Florry** is a hyperlocal multi-vendor e-commerce platform designed to connect flower lovers with local boutique florists. The platform enables users to browse nearby flower shops, view their collections, and order fresh floral arrangements for swift delivery. It serves as a bridge between local artisans ("Admins") and customers, streamlining order management, payments, and delivery.

### 1.1 Goal
To create a seamless, premium, and nature-inspired digital marketplace that empowers local florists to sell online while providing customers with a transparent and high-quality flower buying experience.

### 1.2 Target Audience
1.  **Customers**: Individuals looking for fresh flowers for gifting, decoration, or personal use.
2.  **Vendors (Admins)**: Local flower shop owners wanting to expand their reach digitally.
3.  **Platform Administrators**: The core team managing the Florry ecosystem.

---

## 2. User Personas & User Flow

### 2.1 Customer
*   **Needs**: Fast delivery, fresh products, easy discovery of local shops, secure payment.
*   **Flow**: Landing Page -> Search/Select Shop -> Browse Products -> Add to Cart -> Checkout -> Track Order.

### 2.2 Vendor (Shop Admin)
*   **Needs**: Easy product listing, order notification, sales tracking, inventory management.
*   **Flow**: Login/Signup -> Dashboard -> Manage Inventory -> View Incoming Orders -> Update Order Status -> View Reports.

### 2.3 Super Admin
*   **Needs**: Oversight of all shops and users, moderation capabilities, platform health metrics.
*   **Flow**: Login -> Dashboard -> Approvals (New Shops) -> Platform Analytics -> User Support.

---

## 3. Functional Requirements

### 3.1 Feature Set: Customer Interface
| Feature | Description | Priority |
| :--- | :--- | :--- |
| **Authentication** | Sign up/Login via Email. Profile management. | High |
| **Shop Discovery** | Search bar and "Featured Boutiques" list. Filter by location (implied). | High |
| **Product Browsing** | View products by category (Fresh Flowers, Decorations, Garlands, Tied Art). | High |
| **Cart System** | Add/Remove items, view subtotal. | High |
| **Checkout** | address input, payment method selection, order confirmation. | High |
| **Order History** | View past orders and current status. | Medium |
| **Support** | Submission form for inquiries/complaints. | Medium |

### 3.2 Feature Set: Vendor (Admin) Interface
| Feature | Description | Priority |
| :--- | :--- | :--- |
| **Shop Onboarding** | Registration with Shop Name, Aadhaar verification (KYC), Location coordinates. | High |
| **Inventory Mgmt** | CRUD operations for Flowers (Image, Price, Stock, Weight). | High |
| **Order Management** | View new orders, update status (Pending -> Processing -> Delivered). | High |
| **Analytics** | View total sales, daily orders, most popular items. | Medium |

### 3.3 Feature Set: Super Admin Interface
| Feature | Description | Priority |
| :--- | :--- | :--- |
| **Shop Verification** | Approve or reject pending vendor registrations. | High |
| **User Management** | View all users and vendors. | Medium |
| **Platform Reports** | Global sales data and platform activity. | Low |

---

## 4. Technical Architecture

### 4.1 Tech Stack
*   **Frontend**: HTML5, Vanilla CSS3 (Custom Design System), JavaScript (ES6+).
*   **Backend**: Python (FastAPI).
*   **Database**: PostgreSQL (via SQLAlchemy ORM).
*   **Deployment**: Vercel (Frontend), Railway/Render/Others (Backend - assumed).

### 4.2 Database Schema (Core Entities)
*   **Users**: Stores customer details (`name`, `email`, `phone`, `address`).
*   **Admins**: Stores vendor details (`shop_name`, `status`, `aadhaar`, `lat/long`).
*   **Flowers**: Products linked to Admins (`name`, `price`, `stock`, `category`).
*   **Orders**: Transaction records linking User and Admin.
*   **OrderItems**: Pivot table for specific items in an order.
*   **Cart**: Temporary storage for user selection.
*   **Reports**: Aggregated data for vendors.
*   **SupportMessages**: Customer inquiries.

---

## 5. UI/UX Guidelines
*   **Visual Style**: "Nature's Finest," "Premium," "Fresh."
*   **Color Palette**: Organic greens, soft creams, and vibrant accent colors (from flower imagery).
*   **Typography**: Clean, sans-serif fonts (e.g., 'Outfit') for modern readability.
*   **Responsiveness**: Mobile-first design ensuring usability on all devices.

---

## 6. Future Scope
1.  **Rider Integration**: Dedicated app for delivery personnel to pick up from vendors and deliver to users.
2.  **Live Tracking**: Real-time map tracking of orders.
3.  **Social Login**: Google/Facebook authentication.
4.  **Advanced Analytics**: Heatmaps for vendors to see demand areas.
