# AREA
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE.txt)

AREA is a multi-faceted project. Our task was to recreate the environment of IFTTT.

## Overview

AREA is divided into several components:

- **Frontend:** Built using Vue.js
- **Mobile App:** Developed using Flutter
- **Backend:** Constructed with NestJS
- **Database:** Utilizes PostgreSQL

This project aims to have multiple services available for the client's usage, that can be connected between eachother through actions and reactions. An action is described by an event that happens in a service. If this event matches an action that has been activated by the user, the appropriate reaction will be trigered.

## Components

### 1. Web (Vue.js)

The web version of our app. The front's goal is to display to the user our app's features and make it the most pleasant experience possible.

### 2. Mobile App (Flutter)

The mobile version of our app. The mobile, even though very identical to the web version, has a different interface to make it more adapted for a phone.

### 3. Backend (NestJS)

The backend of the project. Its purpose is to handle all the API calls and the communication with the database.

### 4. Database (PostgreSQL)

The database is where all the data is stored. This is where all the API information and the user's data will be saved in order to always have an easy access to it at any time.

## Installation and Setup

To get started with the AREA project, follow these steps:

```
docker compose up --build
```
This will start up the database and the backend

1. **Frontend:**
   - Head to http://localhost:8081

2. **Mobile App:**
   - Head to http://localhost:8080/mobile-apk to download the apk

## Contributing

We welcome contributions to AREA! If you wish to contribute, please follow these guidelines:
- Fork the repository
- Create a new branch for your feature or bug fix
- Ensure your code follows the project's coding standards
- Submit a pull request detailing the changes made

## Contact Information

For any inquiries or feedback, please contact:
- [Sean Jaboulet](mailto:sean.jaboulet@epitech.eu)
- [Pascal Lin](mailto:pascal.lin@epitech.eu)
- [Alberick Mahoussi](mailto:mahoussisolen@gmail.com)
- [Aurélien Lenfant](mailto:aurelien@example.com)
- [Louis Ferrari](mailto:louis@example.com)
