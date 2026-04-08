# Testing Suite for Afterglow

How to run e2e tests:

1. Start the containers with: 
    -  docker compose up -d

2. Run the tests with from project root: 
    - For system smoke testing only
        - npx playwright test e2e/smoke
    - For security tests
        - npx jest e2e/security/api-bypass.spec.ts

Additional commands:
    - npx playwright test -- headed


To run unit tests and e2e tests in backend/api:
    - cd backend/api
    Includes the tests in backend/api/src
    - npm run test
    Includes the tests in backend/api/test
    - npm run test:e2e


