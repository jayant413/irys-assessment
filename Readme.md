## Live Link

[https://irys-product-manager.vercel.app](https://irys-product-manager.vercel.app)

## Instructions to run project locally

1. Clone the repository

   ```
   git clone git@github.com:jayant413/irys-assessment.git
   cd irys-assesment
   ```

- Add Environment variables ( Can skip if running with Docker )

  ### Client (client/.env)

  ```
  VITE_API_URL=http://localhost:8080/api
  ```

  ### Server (server/.env)

  ```
  CORS_ORIGIN=http://localhost:5173
  PORT=8080
  MONGODB_URI=mongodb://localhost:27017/irys_products
  REDIS_URL=redis://localhost:6379
  ```

2. Run the project using docker

- start with logs

  ```
  docker-compose up
  ```

- start without logs

  ```
  docker-compose up -d
  ```

- stop the containers

  ```
  docker-compose down
  ```

  OR

2. Run manually (without Docker) Make sure MongoDB and Redis are running locally on your system

- This will run both the client and server concurrently.

  ```
  npm run deps
  npm run dev
  ```

3. ## Visit the app on

- [http://localhost:5173](http://localhost:5173)

## Fuctional Requirements

### Backend

- Get products apis supporting with pagination and filtering.
- Product upload with validation (using zod).
- Products bulk (list) upload api also disable old products.
- Toggle product status api.

### Frontend

- Virtual scrolling fetch products using pagination.
- Filters

## Non Functional requirements

### Maintainablility

- Clean folder structure
- Using typescript for type safety
- Follow DRY (Don't Repeat Yourself) priciple

### Performance

- Using Redis for fast data retrival for frequently accessed data.

### Portability

- Using Docker to ensure consistent execution across different environments.

### Security

- Implement rate limiting to protect against DDoS and brute-force attacks.
- Uses Helmet to secure HTTP headers and secure from known web vulnerabilities.
