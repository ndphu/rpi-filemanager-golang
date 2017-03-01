import 'whatwg-fetch'
import React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin'
import { render } from 'react-dom'
import { Router, Route, browserHistory , IndexRoute, Redirect } from 'react-router'
import App from './modules/App'

injectTapEventPlugin();

window.getHumanReadableSize = function(bytes) {
  if (bytes == 0) { return "0.00 B"; }
  var e = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes/Math.pow(1024, e)).toFixed(2)+' '+' KMGTP'.charAt(e)+'B';
}


render(
	<MuiThemeProvider>
		<Router history={browserHistory }>
			<Route path="/fm/browse" component={App}>			
			</Route>
			<Redirect path="/fm" to="/fm/browse"/>
		</Router>
	</MuiThemeProvider>, document.getElementById('app'))
