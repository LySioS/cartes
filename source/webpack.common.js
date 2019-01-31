/* eslint-env node */
const HTMLPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const { EnvironmentPlugin } = require('webpack')
const path = require('path')
const { universal, web } = require('./webpack.commonLoaders.js')

module.exports = {
	resolve: {
		alias: {
			Engine: path.resolve('source/engine/'),
			Règles: path.resolve('source/règles/'),
			Actions: path.resolve('source/actions/'),
			Ui: path.resolve('source/components/ui/'),
			Components: path.resolve('source/components/'),
			Selectors: path.resolve('source/selectors/'),
			Reducers: path.resolve('source/reducers/'),
			Types: path.resolve('source/types/'),
			Images: path.resolve('source/images/')
		}
	},
	entry: {
		embauche: ['./source/sites/embauche.gouv.fr/entry.js'],
		'mon-entreprise': ['./source/sites/mycompanyinfrance.fr/entry.fr.js'],
		infrance: ['./source/sites/mycompanyinfrance.fr/entry.en.js'],

		// To not introduce breaking into the iframe integration, we serve simulateur.js from a 'dist' subdirectory
		'dist/simulateur': ['./source/sites/embauche.gouv.fr/iframe-script.js'],
		publicodes: ['./source/sites/publicodes/entry.js']
	},
	output: {
		path: path.resolve('./dist/')
	},
	module: {
		rules: [...web, ...universal]
	},
	plugins: [
		new EnvironmentPlugin({
			EN_SITE: '/infrance${path}',
			FR_SITE: '/mon-entreprise${path}'
		}),
		new HTMLPlugin({
			template: 'index.html',
			chunks: ['infrance'],
			title:
				'My company in France: A step-by-step guide to start a business in France',
			description:
				'Find the type of company that suits you and follow the steps to register your company. Discover the French social security system by simulating your hiring costs. Discover the procedures to hire in France and learn the basics of French labour law.',
			filename: 'infrance.html'
		}),
		new HTMLPlugin({
			template: 'index.html',
			chunks: ['embauche'],
			title: "Simulateur d'embauche 🤝",
			description:
				"Simulation du prix d'une embauche en France et calcul du salaire net à partir du brut : CDD, statut cadre, cotisations sociales, retraite...",
			filename: 'embauche.html'
		}),
		new HTMLPlugin({
			template: 'index.html',
			chunks: ['mon-entreprise'],
			title:
				'Mon-entreprise : Un guide pas à pas pour créer une entreprise en France',
			description:
				'Du status juridique à premier embauche, vous trouverez ici toutes les ressources nécessaires pour démarrer votre activité.',
			filename: 'mon-entreprise.html'
		}),
		new HTMLPlugin({
			template: 'index.html',
			chunks: ['publicodes'],
			title: 'publicodes ✍️',
			description:
				'Une base de connaissance ? Du code ? Les deux à la fois. Lancement imminent !',
			filename: 'publicodes.html'
		}),

		new CopyPlugin([
			'./manifest.webmanifest',
			'./source/sites/embauche.gouv.fr/images/logo',
			{
				from: './source/sites/embauche.gouv.fr/robots.txt',
				to: 'robots.embauche.txt'
			},
			{
				from: './source/sites/mycompanyinfrance.fr/robots.txt',
				to: 'robots.infrance.txt'
			},
			{
				from: './source/sites/mycompanyinfrance.fr/sitemap.fr.txt',
				to: 'sitemap.infrance.fr.txt'
			},

			{
				from: './source/sites/mycompanyinfrance.fr/sitemap.en.txt',
				to: 'sitemap.infrance.en.txt'
			}
		])
	]
}
