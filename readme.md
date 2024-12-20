# NOTES!

Notes is a responsive single page web application that saves texts from the users. Despise that, Users can group their notes with categories, filter between notes and categories (by most recent,most text, category with most notes,...) and add images to their texts.

## Index

1. [Dependencies] (#Depedencies) 
2. [Database Constitution](#Database) 
3. [Folder Structure](#Folder) 
4. [Before getting in the website](#Before-entering-website) 
5. [Running the Website](#Running-website) 
6. [Run app on electron](#Run-on-electron) 

## Dependencies

For the website run as it should, the user will need to install node.js , express , mongodb and mongo compass

### How to install node.js

- Using nvm 

```
# installs nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# download and install Node.js (you may need to restart the terminal)
nvm install 23

```

- Using Brew

```
# download and install Node.js
brew install node@23

```

### How to install express

```
npm install express --save

```

### How to install mongo and mongo compass

- Website to install [Mongodb](https://www.mongodb.com/pt-br).

- Website to install [Mongo-Compass](https://www.mongodb.com/products/tools/compass)

## Database

This project contains 1 database with 3 collections:

- The users profiles (with username,password, image of the profile and email, categories)
- Notes of each users (user, note content, note images, category)
- Categories (Category name, notes inside that category)

## Folder

Here's the project constitution:

```
assignment3/
├── static/
│   ├── images/
│   ├── global.css
│       ├── lupa.png
│       ├── nota.png
│       ├── person.png
├── data 
├── fonts
├── index.html
├── server.js

```

- **data:** Includes data to the database
- **fonts:** Fonts files used in the website

## Before entering website

In order to the user enter the website, it's necessary to start the server and mongo db. Here's the steps to make it happen:

1. Open a terminal shell

2. On the terminal shell, insert the following commands:

```
cd ./assignment3
node server.js

```

3. Open other terminal shell and insert the following commands:

```
cd ./assignment3
mongod --dbpath data --port 27017 
```

4. Open your browser of choice and insert the following link:

```
http://localhost:27017 
```

## Running website

Now that you're on the website, you can create an account (you also can login and get a password if you forgot yours).

1. Click in create an account
2. insert your username, email and password

Now that you're registered, you can start by creating a note:
1. Click on create note (on the top corner right)
2. Add your note title and content
3. Click on the button save note (bottom corner left)

You can also add a new profile user image:
1. Click on the profile (top corner right)
2. Click on the button edit image (center of the screen)
3. Add your image

## Run on electron

### Install electron

To be able to get the webpage running as an app, you'll need to install electron

1. Insert the following command in your terminal:

```
npm install -g electron
```

2. Once installed, run the following command

```
electron .
```

