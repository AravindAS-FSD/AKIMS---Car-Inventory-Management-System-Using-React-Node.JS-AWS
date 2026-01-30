# 📦 Inventory Management System

A production-ready **full-stack inventory management system** with reporting and analytics, built using **React** and **AWS Serverless architecture**. The system is designed to manage products, track inventory movements, log sales and purchases, and generate daily profit reports with export capabilities.

This project demonstrates real-world usage of **AWS Lambda, API Gateway, DynamoDB, S3, and CloudFront**, following scalable and maintainable design practices.

---

## 🚀 Features

### Product Management

* Add, update, and delete products
* Category, subcategory, and supplier support
* Image upload and storage

### Inventory & Activity Tracking

* Automatic inventory change tracking
* Sales and purchase activity logs
* Role-based logging (Admin / Staff)

### Reports & Analytics

* Inventory change reports
* Sales & purchase logs
* Daily profit and revenue summary
* CSV export for offline analysis

### Security & Access Control

* JWT-based authentication
* Role-based authorization
* Secure API access via API Gateway

---

## 🛠 Tech Stack

### Frontend

* React
* Axios
* Context API
* Responsive UI (Desktop & Mobile)

### Backend

* AWS Lambda (Node.js)
* Amazon API Gateway
* Amazon DynamoDB
* JWT Authentication

### Deployment

* Amazon S3 (Static Hosting)
* Amazon CloudFront (CDN)

---

## ☁️ Deployment Architecture

```
React App
   │
   ▼
CloudFront (CDN)
   │
   ▼
S3 Bucket (Static Files)
   │
   ▼
API Gateway
   │
   ▼
AWS Lambda ── DynamoDB
```

---

## ⚙️ Setup Instructions

### Frontend Setup

```bash
npm install
npm start
```

### Production Build

```bash
npm run build
```

---

## 🚀 Frontend Deployment (S3 + CloudFront)

1. Create an **S3 bucket** and enable *Static Website Hosting*
2. Upload the contents of the `build/` folder
3. Create a **CloudFront distribution** pointing to the S3 bucket
4. Configure:

   * Default root object: `index.html`
   * Error responses (403/404) → redirect to `index.html`
5. Access the app using the CloudFront distribution URL

---

## 🧩 Backend Deployment

* AWS Lambda functions deployed behind API Gateway
* JWT-secured REST APIs
* DynamoDB tables for:

  * Products
  * Reports
  * Logs
  * Profits

---

## 📊 Reports Module – Known Issues

* Some inventory reports may show product names as `Unknown` due to historical log entries or mapping gaps
* Inventory report API requires optimization for large datasets

> These issues are identified and planned for future updates.

---

## 🔮 Future Enhancements

* Fix product-to-report name mapping permanently
* Add pagination and filtering to reports
* Improve API performance and indexing
* Implement CI/CD using GitHub Actions
* Add audit logs and role-based dashboards

---

## 📁 Project Structure

```
src/
 ├── components/
 ├── pages/
 ├── context/
 ├── hooks/
 ├── assets/
 ├── App.js
 └── index.js
```

---

## 🧠 What This Project Demonstrates

* Real-world AWS Serverless architecture
* Secure, role-based API design
* Clean React application structure
* Practical reporting and analytics implementation
* Production-ready deployment approach

---

## 📌 Status

🟢 Actively developed

---

## 📜 License

This project is licensed for learning and demonstration purposes.

---

⭐ If you find this project useful, consider starring the repository!
