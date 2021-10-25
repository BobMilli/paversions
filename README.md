# paversions
## Why this application ?
IBM Planning Analytics is really a great software.
Since a while now, it has been splitted in "products" :
* Planning Analytics Local / TM1, which I call PAL, is the database engine,
* Planning Analytics Workspace, which I call PAW, is the Web Dashboarding and Modeling application,
* Planning Analytics for Microsoft Excel, which I call PAX, is the Microsoft Excel Addin
* Planning Analytics Spreadsheet Services, which I call PASS or TM1Web, is the way to access Excel published material linke to TM1 from a Web application

Each "product" has its own life and so its own versioning, release schedule and its own dedicated web page on the IBM website.

I've always been frustrated by the fact that there was no centralized webservice which could deliver information about what are the available versions for each "product" so I decided to take the challenge to try to build something that could deliver these information.

## What you need to run it locally ?

You'll need [NodeJS](https://nodejs.org/en/) for the backend and [QuasarCLI](https://quasar.dev/quasar-cli/installation) for the frontend, installed on your computer.

If you want to build it directly from my repo, once you've replicated my repo locally, just run a `npm install` from the main folder and it will grab the npm needed packages (express, puppeteer & cors).


> [express](http://expressjs.com/) : Fast, unopinionated, minimalist web framework for Node.js

> [puppeteer](https://github.com/puppeteer/puppeteer) : Headless Chrome Node.js API

> cors : it's a package used to manage **cross origin resource sharing**. I've added but I'm not sure it's mandatory if both back & front ends are hosted on the same box

Just run `node .\app.js` from the main folder and access http://localhost:3000/#/ and you're done !

## How to update the back end
Everything is in the `app.js` from the main folder and it's, IMHO, quite straight forward.

_Don't blame me for having some code repeated but I didn't manage to get the initial version, with all the products in one call, work on [Heroku](https://dashboard.heroku.com/apps).
By splitting the main function for each product (PAW, TM1, PAX & TM1Web), no more time out issue._

## How to update the front end ?
Having QuasarCLI installed, go in the `front`subfolder and run a `npm install` to install all the required npm packages.

In order to run the front end just type `quasar dev` and it will build the app and launch the browser.
All the code is within the `front\src\pages\Index.vue` file.

_Once again, I have stacked 4 fetch commands in order to deal with multiple calls to the backends. I've done it this way once again because of the timeout issue on Heroku._

When you're satisfied with your code, stop Quasar and run a `quasar build` in order to generate the static stuff (html, js & css).
Copy `front\dist\spa` content directly in the `public` folder and then stop / restart the backend.



