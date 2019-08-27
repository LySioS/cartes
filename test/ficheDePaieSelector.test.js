/* @flow */

import { expect } from 'chai'
// $FlowFixMe
import salariéConfig from 'Components/simulationConfigs/salarié.yaml'
import {
	analysisToCotisationsSelector,
	COTISATION_BRANCHE_ORDER
} from 'Selectors/ficheDePaieSelectors'
import { analysisWithDefaultsSelector } from 'Selectors/analyseSelectors'
import { getRuleFromAnalysis } from 'Engine/rules'
import rawRules from 'Règles/base.yaml'
// $FlowFixMe

let state = {
	form: {
		conversation: {
			values: {
				'contrat salarié': { salaire: { 'brut de base': '2300' } },
				entreprise: { effectif: '50' }
			}
		}
	},
	simulation: {
		config: salariéConfig
	},
	conversationSteps: {
		foldedSteps: []
	},
	rules: rawRules
}

let cotisations = null,
	analysis

describe('pay slip selector', function() {
	beforeEach(() => {
		// $FlowFixMe
		cotisations = analysisToCotisationsSelector(state)
		analysis = analysisWithDefaultsSelector(state)

		expect(cotisations).not.to.eq(null)
	})
	it('should have cotisations grouped by branches in the proper ordering', function() {
		// $FlowFixMe
		let branches = cotisations.map(([branche]) => branche)
		expect(branches).to.eql(COTISATION_BRANCHE_ORDER)
	})

	it('should collect all cotisations in a branche', function() {
		// $FlowFixMe
		let cotisationsSanté = (cotisations.find(([branche]) =>
			branche.includes('santé')
		) || [])[1].map(cotisation => cotisation.nom)
		expect(cotisationsSanté).to.have.lengthOf(3)
		expect(cotisationsSanté).to.include('maladie')
		expect(cotisationsSanté).to.include('complémentaire santé')
		expect(cotisationsSanté).to.include('médecine du travail')
	})

	it('should sum all cotisations', function() {
		let pat = getRuleFromAnalysis(analysis)(
				'contrat salarié . cotisations . patronales à payer'
			),
			sal = getRuleFromAnalysis(analysis)(
				'contrat salarié . cotisations . salariales'
			)
		expect(pat.nodeValue).to.be.closeTo(840.4, 5)
		expect(sal.nodeValue).to.be.closeTo(498, 5)
	})

	it('should have value for "salarié" and "employeur" for a cotisation', function() {
		// $FlowFixMe
		let cotisationATMP = (cotisations.find(([branche]) =>
			branche.includes('accidents du travail et maladies professionnelles')
		) || [])[1][0]
		expect(cotisationATMP.montant.partSalariale).to.be.closeTo(0, 0.1)
		let defaultATMPRate = 2.22 / 100
		expect(cotisationATMP.montant.partPatronale).to.be.closeTo(
			2300 * defaultATMPRate,
			1
		)
	})
})
