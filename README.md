# User API – Spam Reporting & Contacts

This project is a RESTful API built with Node.js, Express, and Prisma. It handles user registration, authentication, spam reporting, contacts management, and global search. Detailed user views and conditional email exposure (based on contact relationships) which ensure privacy.


## Features
- **User Registration & Authentication:** Secure registration and JWT-based login.
- **User Profile:** Retrieve profile information for the logged-in user.
- **Spam Reporting:** Users can report phone numbers as spam with spam likelihood calculated based on reports.
- **Contacts Management:** Users can add contacts to their contact list and retrieve them.
- **Global Search by Name:** Search for users by name—first returns users whose names start with the query, then those with names that contain the query.
- **Global Search by Phone:** If a phone number belongs to a registered user, return that user’s details; otherwise, return all contact entries that match that phone number.
- **Conditional Data Exposure:** Detailed user info including email is shown **only** if the logged-in user is in the target user’s contact list.

## Tech Stack
- **Node.js & Express:** Server and API framework.
- **Prisma:** ORM for database interactions.
- **JWT:** JSON Web Tokens for authentication.
- **bcrypt:** For password hashing.
- **express-validator:** For input validation.

## Installation
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the database:**  
   Ensure you have your database (e.g., PostgreSQL, MySQL) ready and configure the connection string.

## Setup and Environment
Create a `.env` file in the root directory and add

```env
PORT=3000
DATABASE_URL="your_database_connection_string"
JWT_SECRET="your_secret_key"
```

Then run the migrations and generate the Prisma client:
```bash
npx prisma migrate dev --name init
npx prisma generate 
```

OR you can use the same sql link provided in the codebase


## Prisma Studio
To inspect and verify the state of your database, you can use Prisma Studio. This tool provides a user-friendly web interface to view and modify your database records.

1. In the root of your project, run:
`npx prisma studio`
2. A web interface will open in your browser where you can inspect models like , , and .


## Usage
Start the development server:
The API will run on `http://localhost:3000`

## API Endpoints

### 1. User Authentication

- **Register a User**  
  **Endpoint:** `POST /api/users/register`  
  **Body:**
  ```json
  {
    "name": "John Doe",
    "phone": "1111111111",
    "email": "johndoe@example.com",
    "password": "password123"
  }
  ```  
  **Description:** Creates a new user.

- **Login a User**  
  **Endpoint:** `POST /api/users/login`  
  **Body:**
  ```json
  {
    "phone": "1111111111",
    "password": "password123"
  }
  ```  
  **Response:** Returns a JWT token for authenticated requests.

### 2. User Profile

- **Get Profile**  
  **Endpoint:** `GET /api/users/profile`  
  **Headers:** `Authorization: Bearer <JWT_TOKEN>`  
  **Description:** Retrieves the profile details of the logged-in user.

### 3. Spam Reporting

- **Report Spam**  
  **Endpoint:** `POST /api/users/report`  
  **Headers:** `Authorization: Bearer <JWT_TOKEN>`  
  **Body:**
  ```json
  {
    "phone": "2222222222"
  }
  ```  
  **Description:** Reports a phone number as spam. The spam likelihood is calculated based on the number of reports.

### 4. Contacts Management

- **Add a Contact**  
  **Endpoint:** `POST /api/users/contacts`  
  **Headers:** `Authorization: Bearer <JWT_TOKEN>`  
  **Body:**
  ```json
  {
    "name": "Alice",
    "phone": "9876543210"
  }
  ```  
  **Description:** Adds a contact to the logged-in user's contact list.

- **Get All Contacts**  
  **Endpoint:** `GET /api/users/contacts`  
  **Headers:** `Authorization: Bearer <JWT_TOKEN>`  
  **Description:** Retrieves all contacts for the logged-in user.

### 5. Search

- **Search by Name**  
  **Endpoint:** `GET /api/users/search?name=John`  
  **Headers:** `Authorization: Bearer <JWT_TOKEN>`  
  **Description:**  
  - Results first show users whose names start with "John", then users whose names contain "John".  
  - Each result includes `name`, `phone`, and `spamLikelihood`.

- **Search by Phone**  
  **Endpoint:** `GET /api/users/search/phone?phone=1111111111`  
  **Headers:** `Authorization: Bearer <JWT_TOKEN>`  
  **Description:**  
  - **If Registered:** Returns the user’s details (name, phone, email, spamLikelihood).  
  - **If Not Registered:** Returns all contact entries with that phone number, which may have different names from various contact books.

### 6. Detailed View

- **Get Detailed User Info**  
  **Endpoint:** `GET /api/users/:id`  
  **Headers:** `Authorization: Bearer <JWT_TOKEN>`  
  **Description:**  
  Provides complete details for a user along with spam likelihood.  
  **Conditional Email Display:**  
    - The email is returned only if the target user is registered **and** the logged-in user's phone number is found in the target user’s contacts.
