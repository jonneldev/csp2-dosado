<!-- NOTE: modify this file based on your project specifications-->

## E-COMMERCE API DOCUMENTATION

***INSTALLATION COMMAND:***

```npm install```

***TEST ACCOUNTS:***
- Regular User:
     - email: user@mail.com
     - pwd: user1234
- Admin User:
    - email: admin@mail.com
    - pwd: admin1234
    

***USER ROUTES:***
- User registration (POST)
	- http://localhost:4000/users/register
    - auth header required: NO
    - request body: 
        - firstName (string)
        - lastName (string)
        - email (string)
        - mobileNo (string)
        - address (string)
        - password (string)

- User login (POST)
	- http://localhost:4000/users/login
    - auth header required: NO
    - request body: 
        - email (string)
        - password (string)
- User retrieve details (GET)
	- http://localhost:4000/users/details
    - auth header required: YES
    - request body: none
- User reset password (POST)
	- http://localhost:4000/users/reset-password
    - auth header required: YES
    - request body: 
        - newPassword (string)
- User update profile (PUT)
	- http://localhost:4000/users/profile
    - auth header required: YES
    - request body: 
        - firstName (string)
        - lastName (string)
        - mobileNo (string)
        - address (string)
- User set admin (PUT)
	- http://localhost:4000/users/set-admin/:userId
    - auth header required: YES
    - request body: none

***PRODUCT ROUTES:***
- Create Product (Admin only) (POST)
	- http://localhost:4000/products/
    - auth header required: YES
    - request body: 
        - name (string)
        - description (string)
        - price (number)
        - stock (number)
- Retrieve all products (Admin only) (GET)
	- http://localhost:4000/products/
    - auth header required: NO
    - request body: none
- Retrieve all active products (GET)
	- http://localhost:4000/products/active
    - auth header required: NO
	- request body: none
- Retrieve single products (GET)
	- http://localhost:4000/products/:productId
    - auth header required: NO
	- request body: none
- Update a products (PUT)
	- http://localhost:4000/products/:productId
    - auth header required: YES
	- request body: 
        - name (string)
        - description (string)
        - price (number)
        - stock (number)
- Archive product (PUT)
	- http://localhost:4000/products/:productId
    - auth header required: NO
	- request body: none
- Activate product (PUT)
	- http://localhost:4000/products/:productId
    - auth header required: NO
	- request body: none

***Order ROUTES:***
- Make Order (POST)
	- http://localhost:4000/orders/
    - auth header required: YES
    - request body: 
        - productId (string)
        - quantity (number)
- Retrieve Order (GET)
	- http://localhost:4000/orders/
    - auth header required: YES
    - request body: none
- Retrieve All Order (GET)
	- http://localhost:4000/orders/
    - auth header required: YES
    - request body: none

***CART ROUTES:***
- Add to cart product (POST)
	- http://localhost:4000/cart/
    - auth header required: YES
    - request body: 
        - productId (string)
        - quantity (number)
- Retrieve product added to cart (GET)
	- http://localhost:4000/cart/
    - auth header required: YES
    - request body: none
- Update cart (PUT)
	- http://localhost:4000/cart/:productId
    - auth header required: YES
    - request body: 
        - productId (string)
        - quantity (number)
- Remove product from cart (DEL)
	- http://localhost:4000/cart/:productId
    - auth header required: YES
    - request body: none
