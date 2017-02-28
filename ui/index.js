import 'whatwg-fetch'
import React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin'
import { render } from 'react-dom'
import { Router, Route, browserHistory , IndexRoute, Redirect } from 'react-router'
import App from './modules/App'

injectTapEventPlugin();


render(
	<MuiThemeProvider>
		<Router history={browserHistory }>
			<Route path="/fm" component={App}>			
			</Route>
			<Redirect from='*' to='/fm' />
		</Router>
	</MuiThemeProvider>, document.getElementById('app'))
