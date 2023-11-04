import Emoji from '@/components/Emoji'

export default function BikeRouteRésumé({ data }) {
	if (!data.features) return
	const feature = data.features[0]
	if (!feature) return

	const seconds = feature.properties['total-time'],
		date = new Date(1000 * seconds).toISOString().substr(11, 8).split(':'),
		heures = +date[0],
		minutes = date[1]

	const dénivelé = feature.properties['plain-ascend']
	return (
		<div
			css={`
				display: flex;
				background: var(--lightestColor);
				padding: 0.6rem;
				max-width: 20rem;
				color: var(--darkestColor);
				line-height: 1.4rem;
				border: 5px solid var(--color);
				img {
					margin-right: 0.4rem;
					width: 2.5rem;
					height: auto;
				}
			`}
		>
			{' '}
			<Emoji e="🚲️" />
			<p>
				Le trajet jusqu'à la gare vous prendra{' '}
				<strong>
					{heures ? heures + ` heure${heures > 1 ? 's' : ''} et ` : ''}
					{minutes} minutes
				</strong>{' '}
				pour un total de <strong>{dénivelé} m de dénivelé</strong>.
			</p>
		</div>
	)
}
