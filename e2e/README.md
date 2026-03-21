# Testing 

How to run e2e tests:

1. Start the containers with: 
    -  compose up -d

2. Run the tests with: 
    - For a full system test (smoke + regression testing)
        - npx playwright test
    - For system smoke testing only
        - npx playwright test e2e/smoke

Additional commands:
    - npx playwright test -- headed


