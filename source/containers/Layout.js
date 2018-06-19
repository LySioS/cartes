import { I18nextProvider } from 'react-i18next'
import i18next from 'i18next'

import React, { Component } from 'react'
import './Layout.css'
import './reset.css'

import { Route, Router, Switch, Redirect } from 'react-router-dom'

import Home from 'Components/pages/Home'
import RulePage from 'Components/RulePage'
import Route404 from 'Components/Route404'
import Contact from 'Components/Contact'
import RulesList from 'Components/pages/RulesList'
import Mecanisms from 'Components/Mecanisms'
import Contribution from 'Components/pages/Contribution'
import Integration from 'Components/pages/Integration'
import About from 'Components/pages/About'
import createHistory from 'history/createBrowserHistory'
import { Header } from 'Components/pages/Header'
import withTracker from '../components/withTracker'

class Layout extends Component {
	history = createHistory()
	componentDidMount() {
		this.props.tracker.push(['trackPageView'])
	}
	render() {
		let { tracker } = this.props
		// track the initial pageview
		return (
			<I18nextProvider i18n={i18next}>
				<Router history={tracker.connectToHistory(this.history)}>
					<>
						<Header />
						<Switch>
							<Route exact path="/" component={Home} />
							<Route path="/contact" component={Contact} />
							<Route path="/règle/:name" component={RulePage} />
							<Redirect from="/simu/*" to="/" />
							<Route path="/règles" component={RulesList} />
							<Route path="/mecanismes" component={Mecanisms} />
							<Route path="/à-propos" component={About} />
							<Route path="/intégrer" component={Integration} />
							<Route path="/contribuer" component={Contribution} />
							<Redirect from="/simulateur" to="/" />
							<Redirect from="/couleur.html" to="/" />
							<Route component={Route404} />
						</Switch>
					</>
				</Router>
			</I18nextProvider>
		)
	}
}

export default withTracker(Layout)
