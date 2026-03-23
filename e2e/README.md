# Testing Suite for Afterglow

How to run e2e tests:

1. Start the containers with: 
    -  docker compose up -d

2. Run the tests with from project root: 
    - For a full system test (smoke + regression testing)
        - npx playwright test
    - For system smoke testing only
        - npx playwright test e2e/smoke

Additional commands:
    - npx playwright test -- headed


To run unit tests and e2e tests in backend/api:
    - cd backend/api
    Includes the tests in backend/api/src
    - npm run test
    Includes the tests in backend/api/test
    - npm run test:e2e


