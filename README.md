BAKERBURNS

Overview
  This application is a full-stack platform built to provide an intuitive user experience for managing various aspects of an e-commerce system. It includes features like user authentication, product management, event scheduling, and dynamic cart functionality, among others.

Features

  User Authentication

    Sign-up and Login: Users can create accounts and log in using secure password authentication. 

    Google OAUTH

    Password Management: Password reset and setup forms are integrated.

    Privacy and Terms Acceptance: Users are required to accept privacy policies and terms before checkout.

  Product Management

    Storefront: Displays products with categories and search functionality.

    Admin Product Management: Allows admins to manage product details, including adding, editing, and removing products.

    Discount Management: Admins can create and manage product discounts, with a clean UI to showcase discount details.

  Cart and Checkout

    Dynamic Cart: Supports guest and authenticated user carts.

    Checkout Options: Secure checkout for both guest and registered users.

    Stripe Integration: Payment processing via Stripe Webhooks.

    Order Notifications: Sends confirmation emails to users and notifications to admins.

  Event Management

    Admin Event Manager: Create, edit, and manage events with dedicated forms and listings.
    User Event View: Allows users to browse upcoming events seamlessly.
    Social Media Links
    Dynamic Social Links: Fetches and displays social media links dynamically with support for deep linking on mobile devices.
    Responsive Design: Fully responsive UI for consistent experience across devices.

Other Features

    Navbar Navigation: A dynamic navbar for easy navigation between pages.
    Privacy Policy and Terms Pages: Dedicated pages to showcase terms and privacy policies.
    Lazy Loading: Pages are lazily loaded to improve performance and initial load times.

Technologies Used

  Frontend

    React: For building the user interface.
    React Router: For client-side routing.
    Framer Motion: Used for animations and modal transitions.
    CSS Modules: For scoped styling.

  Backend

    Node.js: Backend runtime.
    Express.js: Web framework for building APIs.
    Sequelize: ORM for interacting with a relational database.
    Stripe: Payment gateway integration for handling transactions.

  Database

    PostgreSQL: Database for storing application data.

  Deployment

    Vite: For faster builds and hot module replacement.
    GitHub Actions: CI/CD pipelines for automated deployment.
    Nginx: Reverse proxy and HTTPS configuration.
