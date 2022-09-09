import {
	EngineProvider,
	SituationProvider,
	engineOptions,
} from 'Components/utils/EngineContext'
import {
	configSituationSelector,
	situationSelector,
} from 'Selectors/simulationSelectors'

import Engine from 'publicodes'
import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import zeros from './zeroDefaults.yaml'
import { useLocation } from 'react-router'

import transformRules from './transformRules'

// This is a difficult task : categories must equal to zero, in order to not make the test fail without having answered to a non-zero per default category
// but some categories are conditionned by one variable, like the housing which is divided by the number of inhabitants.
// Or, should the number of inhabitants be the first question asked ?
// Yes it should.
// But e.g. the question of number of people in the car is asked after the number of km. Hence we set this number to 2.
const setDefaultsToZero = (rules) =>
	Object.entries(rules).reduce(
		(memo, [k, v]) => ({
			...memo,
			[k]: zeros[k] != null ? { ...v, 'par défaut': zeros[k] } : v,
		}),
		{}
	)

const removeLoader = () => {
	// Remove loader
	var css = document.createElement('style')
	css.type = 'text/css'
	css.innerHTML = `
		#js {
				animation: appear 0.5s;
				opacity: 1;
		}
		#loading {
				display: none !important;
		}
    `
	document.body.appendChild(css)
}

export default ({ children }) => {
	const rules = useSelector((state) => state.rules)

	const dispatch = useDispatch()

	const setRules = (rules) => dispatch({ type: 'SET_RULES', rules })

	const urlParams = new URLSearchParams(window.location.search)
	const location = useLocation()

	if (location.pathname.indexOf('/voyage') === 0) {
		removeLoader()
		return children
	}

	const branch = urlParams.get('branch')
	const pullRequestNumber = urlParams.get('PR')

	useEffect(() => {
		const rulesDomain = ['/simulateur/bilan', '/instructions', '/fin'].find(
			(url) => location.pathname.indexOf(url) === 0
		)
			? 'ecolab-data.netlify.app/co2.json'
			: 'futureco-data.netlify.app/co2.json'

		/* This enables loading the rules of a branch,
		 * to showcase the app as it would be once this branch of -data  has been merged*/
		const rulesURL = `https://${
			branch
				? `${branch}--`
				: pullRequestNumber
				? `deploy-preview-${pullRequestNumber}--`
				: ''
		}${rulesDomain}`
		const dataBranch = branch || pullRequestNumber
		if (
			false && // To be reactivated when in a dev branch for the final work on this test section on the site, that is based on nosgestesclimat's model
			NODE_ENV === 'development' &&
			!dataBranch &&
			rulesDomain.includes('ecolab-data')
		) {
			// Rules are stored in nested yaml files
			const req = require.context(
				'../../nosgestesclimat/data/',
				true,
				/\.(yaml)$/
			)

			// Bigger rule explanations are stored in nested .md files
			const reqPlus = require.context(
				'raw-loader!../../nosgestesclimat/data/actions-plus/',
				true,
				/\.(md)$/
			)

			const plusDottedNames = Object.fromEntries(
				reqPlus
					.keys()
					.map((path) => [
						path.replace(/(\.\/|\.md)/g, ''),
						reqPlus(path).default,
					])
			)

			const rules = req.keys().reduce((memo, key) => {
				const jsonRuleSet = req(key).default || {}
				const ruleSetPlus = Object.fromEntries(
					Object.entries(jsonRuleSet).map(([k, v]) =>
						plusDottedNames[k]
							? [k, { ...v, plus: plusDottedNames[k] }]
							: [k, v]
					)
				)
				return { ...memo, ...ruleSetPlus }
			}, {})

			setRules(setDefaultsToZero(rules))
			removeLoader()
		} else if (
			NODE_ENV === 'development' &&
			!dataBranch &&
			rulesDomain.includes('futureco-data')
		) {
			// Rules are stored in nested yaml files
			const req = require.context(
				'../../futureco-data/data/',
				true,
				/\.(yaml)$/
			)
			const rules = req.keys().reduce((memo, key) => {
				const jsonRuleSet = req(key).default || {}
				const splitName = key.replace('./', '').split('>.yaml')
				const prefixedRuleSet =
					splitName.length > 1
						? Object.fromEntries(
								Object.entries(jsonRuleSet).map(([k, v]) => [
									k === 'index' ? splitName[0] : splitName[0] + ' . ' + k,
									v,
								])
						  )
						: jsonRuleSet
				return { ...memo, ...prefixedRuleSet }
			}, {})

			setRules(transformRules(rules))
			removeLoader()
		} else {
			fetch(rulesURL, { mode: 'cors' })
				.then((response) => response.json())
				.then((json) => {
					setRules(
						rulesURL.includes('futureco')
							? transformRules(json)
							: setDefaultsToZero(json)
					)
					removeLoader()
				})
		}
	}, [location.pathname, branch, pullRequestNumber])

	if (!rules) return null
	return <EngineWrapper rules={rules}>{children}</EngineWrapper>
}

const EngineWrapper = ({ rules, children }) => {
	const engine = useMemo(
			() => new Engine(rules, engineOptions),
			[rules, engineOptions]
		),
		userSituation = useSelector(situationSelector),
		configSituation = useSelector(configSituationSelector),
		situation = useMemo(
			() => ({
				...configSituation,
				...userSituation,
			}),
			[configSituation, userSituation]
		)

	return (
		<EngineProvider value={engine}>
			<SituationProvider situation={situation}>{children}</SituationProvider>
		</EngineProvider>
	)
}
