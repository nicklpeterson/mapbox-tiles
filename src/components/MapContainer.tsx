import { GpsCoordinate } from "../utils/Coordinates";
import mapboxgl from "mapbox-gl";
import ReactMapboxGl from "react-mapbox-gl";
import DrawControl from 'react-mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import DrawRectangle from 'mapbox-gl-draw-rectangle-mode';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useDispatch, useSelector } from "react-redux";
import { mapStyleSelector, zoomSelector } from "../store/formSlice";
import { useEffect, useRef } from "react";
import { setLowerRightCoordinate, setUpperLeftCoordinate } from "../store/formSlice";
import { TxCenter, TxRectMode } from 'mapbox-gl-draw-rotate-scale-rect-mode'

/**
 * This is a workaround for the issue: https://github.com/mapbox/mapbox-gl-js/issues/10173
 */
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

// Minneapolis / St. Paul
const INITIAL_COORDINATES: [number, number] = [-93.16534986838542, 44.96687220057306]
const ESC_KEYBOARD_EVENT: string = 'Escape'

const Map = ReactMapboxGl({
    accessToken: process.env.REACT_APP_MAPBOX_API_ACCESS_TOKEN
});

export const MapContainer = () => {
    const mapStyle = useSelector(mapStyleSelector)
    const zoom = useSelector(zoomSelector)
    const dispatch = useDispatch()
    let drawRef = useRef<DrawControl>(null)

    useEffect(() => {
        const handleKeyPress = (event) => {
            if (
                !event.isComposing &&
                event.key === ESC_KEYBOARD_EVENT
            ) {
                drawRef.current.draw.deleteAll()
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => {
            window.removeEventListener('keydown', handleKeyPress)
        }
    })

    const updateCoordinates = () => {
        const { features } = drawRef.current.draw.getAll()

        if (!features) {
            return [null, null]
        }
        const upperLeft: GpsCoordinate = {
            lat: features[0].geometry.coordinates[0][0][1],
            lon: features[0].geometry.coordinates[0][0][0]
        }
        const lowerRight: GpsCoordinate = {
            lat: features[0].geometry.coordinates[0][2][1],
            lon: features[0].geometry.coordinates[0][2][0]
        }
        dispatch(setUpperLeftCoordinate(upperLeft))
        dispatch(setLowerRightCoordinate(lowerRight))
    }


    const onDrawCreate = () => {
        const currPolygons = drawRef.current.draw.getAll()
        if (drawRef.current.draw.getAll().features.length > 1) {
            drawRef.current.draw.delete(currPolygons.features[0].id)
        }
        updateCoordinates()
    };

    const onDrawUpdate = () => {
        updateCoordinates()
    };

    const onDrawDelete = () => {
        dispatch(setUpperLeftCoordinate({
            lat: null,
            lon: null
        }))
        dispatch(setLowerRightCoordinate({
            lat: null,
            lon: null
        }))
    }

    const onDrawSelectionChange = () => {
        if (drawRef.current.draw.getSelected().features.length > 0) {
            drawRef.current.draw.changeMode('tx_rect', {
                featureId: drawRef.current.draw.getSelected().features[0].id,
                scaleCenter: TxCenter.Opposite,
                canRotate: false
            })
        }
    }

    return (
        <Box sx={{flexGrow: 1}}>
            <Grid container spacing={2}>
                <Grid item xs={11}>
                    <h2>Mapbox Static Tile Downloader</h2>
                </Grid>
                <Map
                    style={`mapbox://styles/mapbox/${mapStyle}`} // eslint-disable-line
                    containerStyle={{
                        height: "700px",
                        width: "96vw",
                        marginLeft: "2vw",
                        marginBottom: "2vw"
                    }}
                    center={INITIAL_COORDINATES}
                    zoom={[zoom]}
                >
                    <DrawControl
                        ref={drawRef}
                        controls={{polygon: true, trash: true}}
                        displayControlsDefault={false}
                        onDrawCreate={onDrawCreate}
                        onDrawUpdate={onDrawUpdate}
                        onDrawDelete={onDrawDelete}
                        onDrawSelectionChange={onDrawSelectionChange}
                        modes={{'draw_polygon': DrawRectangle, 'tx_rect': TxRectMode}}
                    />
                </Map>
            </Grid>
        </Box>
    )
}