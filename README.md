# Blogging Application
This is the backend API for a blogging application built with Express.js. The API provides the necessary routes and functionality to manage blog articles and comments. It includes features for user authentication and authorization, allowing authorized users to create, update, and delete their own articles.

## Features
* **User Registration and Login**: Users can create an account and log in to the application using their credentials. Passwords are securely hashed using bcrypt to protect user data.

* **Token-based Authentication**: The application uses JSON Web Tokens (JWT) for authentication. Upon successful login, users receive a token that is used to authenticate subsequent requests.

* **Protected Routes**: Certain routes in the application require authentication. Users must include the token in the Authorization header to access these protected routes.

* **Viewing Blog Articles**: Users can view a list of published blog articles on the home page. The articles are sorted by title and display relevant information such as the author and publication date.

* **Viewing Individual Articles:** Users can click on an article to view its full content, including the author's name and the comments left by other users. Comments are sorted by date.

* **Submitting Comments**: Users can submit comments on blog articles. Comments include the user's name, the comment content, and the date of submission.

* **Author Features**: Registered authors have additional features available to them:

* **Author Dashboard**: Authors can view a dashboard that displays their own blog articles. The articles are sorted by date.

* **Creating Blog Articles**: Authors can create new blog articles by providing a title, description, image URL, alt text, and content. They can choose to publish the article immediately or save it as a draft.

* **Updating and Deleting Articles**: Authors can update the content of their own articles, including the title, description, image, alt text, and content. They can also delete their articles if needed.

## Installation
To run the blogging application locally, follow these steps:

1. Clone the repository: **git clone <repository_url>**
2. Install the dependencies: **npm install**
3. Set up environment variables: Create a **`.env`** file in the root directory and provide the required environment variables (e.g., database connection URI, secret for JWT).
4. Start the application: **npm start**

   
Make sure you have Node.js and MongoDB installed on your machine.

## Technologies Used
**Express.js**: Backend framework for building the API routes and handling HTTP requests.
**MongoDB**: Database for storing blog articles, user information, and comments.
**Mongoose**: Object Data Modeling (ODM) library for MongoDB, providing a schema-based solution for application data.
**JWT**: JSON Web Tokens for secure authentication and authorization.
**bcrypt**: Library for password hashing to securely store user passwords.
**Express Validator**: Middleware for validating user input and handling form validation errors.
**Luxon**: Library for working with dates and times.
**he**: Library for HTML entity encoding and decoding.

## License
This blogging application is open-source and available under the MIT License.

Feel free to customize and use this application for your own blogging needs!
