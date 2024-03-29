# simple order form, wired up to Square and Sendgrid, for processing payments and sending customer and other email updates

A simple order form, which uploads customer, order, and payment information to Square, where they can be managed via the latter's administrative web portal, and notifies administrators when action is required on new orders. The front end features a leaflet map tile and lets users pick points on the map, in lieu of typing in the address. (But regardless of how it is entered, the address is verified with an Overpass query before the user is prompted for further order and payment information.)

It is designed to run on heroku using their free tier, together with the freely bundled postgresql database provided by them there.
A good, fast way to test this out is to acquire suitable api keys for square and twilio sendgrid and set them as environment variables in a convenient developement environment like gitpod. Everything here is intended to rely solely on services that can be fully sandbox tested without a credit card or financial commitment. (A Heroku Procfile is already included.)

Presumably, the database could be made optional, or ripped out entirely, if that were more convenient, and Square itself instead relied on exclusively (eg, if you wanted to host this somewhere that did not offer any complementary PAAS database). But initially, the code has the assumption of such a database being available for mirroring the Square data hardwired into it.

The rest of this README is boilerplate that came from create-react-app, which was used to scaffold this work.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

