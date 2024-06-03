import getBbox from '@turf/bbox'
import { useEffect } from 'react'
import { useMediaQuery } from 'usehooks-ts'
import { fitBoundsConsideringModal } from '../utils'
import { computeSlopeGradient } from './computeSlopeGradient'

/*
 * Draws the walk or cycle route provided by BRouter directly as Geojson
 * */
export default function useDrawRoute(itineraryMode, map, geojson, id) {
	const isMobile = useMediaQuery('(max-width: 800px)')
	useEffect(() => {
		if (
			!itineraryMode ||
			!map ||
			!geojson ||
			!geojson.features ||
			!geojson.features.length
		)
			return undefined
		console.log('will draw useDrawRoute inside ' + id, id, geojson)

		map.addSource(id, {
			type: 'geojson',
			data: geojson,
			lineMetrics: true,
		})

		if (map) console.log('getsource2', id, map.getSource(id))
		console.log('useDrawRoute did add source')

		map.addLayer({
			id: id + 'PointsSymbols',
			type: 'symbol',
			source: id,
			filter: ['in', '$type', 'Point'],
			paint: {
				'text-color': '#ffffff', //makes the whole drawing fail...
			},
			layout: {
				'text-field': ['get', 'letter'],
				//				'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
				'text-size': 16,
			},
		})
		map.addLayer(
			{
				id: id + 'Points',
				type: 'circle',
				source: id,
				paint: {
					'circle-radius': 12,
					'circle-color': '#2988e6',
					'circle-stroke-color': '#ffffff',
					'circle-stroke-width': 3,
				},
				filter: ['in', '$type', 'Point'],
			},
			id + 'PointsSymbols'
		)

		map.addLayer(
			{
				id: id + 'Line',
				type: 'line',
				source: id,
				layout: {
					'line-join': 'round',
					'line-cap': 'round',
				},
				paint: {
					walking: {
						'line-color': '#8f53c1',
						'line-width': 5,
						// I'm bricoling something here but I don't understand yet how it
						// works precisely
						'line-dasharray': {
							stops: [
								[0, [10, 2]],
								[10, [3, 2]],
								[16, [0.6, 2]],
							],
						},
					},
					distance: {
						'line-width': 0,
					},
					cycling: {
						'line-color': '#57bff5',
						'line-width': 3,
						...(id === 'cycling'
							? {
									'line-gradient': [
										'interpolate',
										['linear'],
										['line-progress'],
										...computeSlopeGradient(geojson),
									],
							  }
							: {}),
					},
				}[id],
				filter: ['in', '$type', 'LineString'],
			},
			'distance' + 'Points'
		)
		if (id === 'cycling')
			map.addLayer(
				{
					id: id + 'secureCycling',
					type: 'line',
					source: id,
					layout: {
						'line-join': 'round',
						'line-cap': 'round',
					},
					paint: {
						'line-color': '#90ee90',
						'line-width': 3,
						'line-offset': 6,
					},
					filter: ['in', '$type', 'LineString'],
				},
				'distance' + 'Points'
			)
		map.addLayer(
			{
				id: id + 'Contour',
				type: 'line',
				source: id,
				layout: {
					'line-join': 'round',
					'line-cap': 'round',
				},
				paint: {
					walking: {
						'line-color': '#5B099F',
						'line-width': 0, // I wasn't able to make a dasharray contour
					},
					distance: {
						'line-width': 2,
						'line-color': '#185abd60',
						'line-dasharray': [8, 8],
					},
					cycling: {
						'line-color': '#5B099F',
						'line-width': 8,
					},
				}[id],
				filter: ['in', '$type', 'LineString'],
			},
			'distance' + 'Line'
		)

		const bbox = getBbox(geojson)

		if (
			geojson.features.filter(
				(f) => f.geometry.type === 'Point' && f.properties.key != null
			).length > 1
		)
			fitBoundsConsideringModal(isMobile, bbox, map)

		return () => {
			// There's something I don't understand in MapLibre's lifecycle...
			// "this.style is undefined" when redimensioning the browser window, need
			// to catch it
			// We're operating on a stale style / map
			try {
				console.log(
					'will remove useDrawRoute' + id,
					map._mapId,
					map.getLayer(id + 'Points')
				)

				map.removeLayer(id + 'Line')
				map.removeLayer(id + 'Contour')
				map.removeLayer(id + 'Points')
				map.removeLayer(id + 'PointsSymbols')
				map.removeSource(id)
			} catch (e) {
				console.log('Could not remove useDrawRoute layers or source', e)
			}
		}
	}, [itineraryMode, geojson, map, id])
}
