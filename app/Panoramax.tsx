import { Viewer } from 'geovisio'
import { FocusedWrapper } from './FocusedImage'
import { useEffect, useRef, useState } from 'react'
import 'geovisio/build/index.css'
import { ModalCloseButton } from './UI'

const servers = {
	meta: 'https://api.panoramax.xyz/api',
	ign: 'https://panoramax.ign.fr/api',
	osm: 'https://panoramax.openstreetmap.fr/api',
}

export default function Panoramax({ id, onMove }) {
	const ref = useRef()
	const [viewer, setViewer] = useState(null)

	useEffect(() => {
		if (!ref || !ref.current || viewer || !id) return
		const panoramax = new Viewer(
			ref.current, // Div ID
			servers.meta,
			{
				selectedPicture: id,
				map: false,
			} // Viewer options
		)
		setViewer(panoramax)
		console.log('panoramax event', panoramax)
		panoramax['sequence-stopped'] = (e) => console.log('panoramax event', e)
		panoramax.addEventListener('psv:view-rotated', (e) =>
			console.log('panoramax event', e.detail)
		)
		panoramax.addEventListener('psv:picture-loading', (e) => {
			const { lat, lon } = e.detail
			onMove({ longitude: lon, latitude: lat })
		})

		return () => {
			//			panoramax.destroy()
		}
	}, [ref, viewer, setViewer, id])

	console.log('panoramax id', id)
	useEffect(() => {
		console.log('should set new panoramax picture id', id)
		if (!viewer || !id) return

		viewer.select(null, id)
	}, [id, viewer])

	if (!id) return null
	return (
		<div
			css={`
				height: 50vh;
				width: 96vw;
				top: 2vw;
				left: 2vw;
				position: fixed;
				z-index: 100;

				@media (min-width: 1000px) {
					width: 50vw;
					height: 90vh;
					top: 4vh;
					right: 4vw;
					left: auto;
				}
				> div {
					position: relative;
					height: 100%;
				}
				> div.fullpage {
					position: fixed;
					top: 0;
					bottom: 0;
					left: 0;
					right: 0;
					height: unset;
					width: unset;
					margin: 0;
				}
				.gvs-main {
					border-radius: 0.6rem;
					overflow: hidden;
					--shadow-color: 45deg 2% 36%;
					--shadow-elevation-medium: 0.3px 0.5px 0.7px
							hsl(var(--shadow-color) / 0.36),
						0.8px 1.6px 2px -0.8px hsl(var(--shadow-color) / 0.36),
						2.1px 4.1px 5.2px -1.7px hsl(var(--shadow-color) / 0.36),
						5px 10px 12.6px -2.5px hsl(var(--shadow-color) / 0.36);
					box-shadow: var(--shadow-elevation-medium);
				}
			`}
		>
			<div ref={ref} />
			<ModalCloseButton onClick={() => alert('Close not implemented')} />
		</div>
	)
}
