import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import { Button, Select, MenuItem, Typography } from "@mui/material";
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import { GpsCoordinate } from "../utils/Coordinates";
import { useDispatch, useSelector } from "react-redux";
import {
    loadingSelector,
    lowerRightCoordinateSelector,
    mapStyleSelector, pixelSelector, setLowerRightCoordinate,
    setMapStyle, setPixels, setUpperLeftCoordinate, setZoomLevel, TileSize,
    upperLeftCoordinateSelector, zoomSelector
} from "../store/formSlice";
import { useEffect, useState } from "react";


const DECIMAL_PLACES = 5

export type formProps = {
    onSubmit: (event) => any
};

const parseCoordinatesToString: (GpsCoordinate) => string = (coordinates: GpsCoordinate) => {
    const lat = coordinates.lat ? String(coordinates.lat) : null
    const lon = coordinates.lon ? String(coordinates.lon) : null

    return !lat || !lon ? '' :
        `[ ${parseFloat(lat).toFixed(DECIMAL_PLACES)}, ${parseFloat(lon).toFixed(DECIMAL_PLACES)} ]`
}

const parseCoordinatesToObject: (string) => GpsCoordinate | null = (coordinateString) => {
    try {
        const coordinate: [number, number] = JSON.parse(coordinateString)
        return {
            lat: coordinate[0],
            lon: coordinate[1]
        }
    } catch (e) {
        return null
    }
}

const validatePixels = (pixels) => pixels === 256 || pixels === 512 || pixels === 1024

export default function RequestForm({onSubmit}: formProps) {
    const dispatch = useDispatch()
    const mapStyle = useSelector(mapStyleSelector)
    const upperLeftCoordinate = useSelector(upperLeftCoordinateSelector)
    const lowerRightCoordinate = useSelector(lowerRightCoordinateSelector)
    const zoomLevel = useSelector(zoomSelector)
    const pixels = useSelector(pixelSelector)
    const isLoading = useSelector(loadingSelector)
    const [localStateUpperLeft, setLocalStateUpperLeft] = useState<string>(parseCoordinatesToString(upperLeftCoordinate))
    const [localStateLowerRight, setLocalStateLowerRight] = useState<string>(parseCoordinatesToString(lowerRightCoordinate))
    const [localPixelState, setLocalPixelState] = useState<string>(String(pixels))

    const handleSelectStyle = (event: any) => {
        dispatch(setMapStyle(event.target.value))
    }

    useEffect(() => {
        setLocalStateUpperLeft(parseCoordinatesToString(upperLeftCoordinate))
        setLocalStateLowerRight(parseCoordinatesToString(lowerRightCoordinate))
    }, [upperLeftCoordinate, lowerRightCoordinate])

    useEffect(() => {
        setLocalPixelState(pixels)
    }, [pixels])

    const handleSelectUpperLeftCoordinates = (event: any) => {
        setLocalStateUpperLeft(event.target.value as string)
        const coordinate = parseCoordinatesToObject(event.target.value as string)
        if (coordinate) {
            dispatch(setUpperLeftCoordinate(coordinate))
        }
    }

    const handleSelectLowerRightCoordinates = (event: any) => {
        setLocalStateLowerRight(event.target.value as string)
        const coordinate = parseCoordinatesToObject(event.target.value as string)
        if (coordinate) {
            dispatch(setLowerRightCoordinate(coordinate))
        }
    }

    const handleSelectZoom = (event) => {
        dispatch(setZoomLevel(event.target.value))
    }

    const handleClickZoom = () => {
        // Change the zoom level to force the view to adjust to current zoom
        // this is a convenience for users to navigate back to the tile zoom level
        dispatch(setZoomLevel(1))
        dispatch(setZoomLevel(zoomLevel))
    }

    const handleSelectPixelSize = (event) => {
        setLocalPixelState(event.target.value)
        const pixels = Number.parseFloat(event.target.value)
        if (validatePixels(pixels)) {
            dispatch(setPixels(pixels as TileSize))
        }
    }

    return (
        <React.Fragment>
            <Box
                component="form"
                sx={{
                    '& > :not(style)': {m: 1, width: '30ch'},
                }}
                noValidate
                autoComplete="off"
                style={{marginTop: '20px'}}
            >
                <TextField
                    required
                    id="outlined-required"
                    label="Upper Left Coordinates"
                    value={localStateUpperLeft}
                    onChange={handleSelectUpperLeftCoordinates}
                    error={!parseCoordinatesToObject(localStateUpperLeft)}
                    disabled={isLoading}
                />
                <TextField
                    required
                    id="outlined-required"
                    label="Lower Right Coordinates"
                    value={localStateLowerRight}
                    onChange={handleSelectLowerRightCoordinates}
                    error={!parseCoordinatesToObject(localStateLowerRight)}
                    disabled={isLoading}
                />
                <TextField
                    id="outlined-required"
                    label="Tile Size in Pixels Squared"
                    value={localPixelState}
                    error={!validatePixels(Number.parseFloat(localPixelState))}
                    onChange={handleSelectPixelSize}
                    disabled={isLoading}
                />
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={mapStyle}
                    // label="Map Style"
                    onChange={handleSelectStyle}
                    disabled={isLoading}
                    style={{marginTop: '8px'}}
                >
                    <MenuItem value={'streets-v11'}>streets-v11</MenuItem>
                    <MenuItem value={'outdoors-v11'}>outdoors-v11</MenuItem>
                    <MenuItem value={'light-v10'}>light-v10</MenuItem>
                    <MenuItem value={'dark-v10'}>dark-v10</MenuItem>
                    <MenuItem value={'satellite-v9'}>satellite-v9</MenuItem>
                    <MenuItem value={'satellite-streets-v11'}>satellite-streets-v11</MenuItem>
                    <MenuItem value={'navigation-day-v1'}>navigation-day-v1</MenuItem>
                    <MenuItem value={'navigation-night-v1'}>navigation-night-v1</MenuItem>
                </Select>
                <Box
                    sx={{width: 320}}
                    style={{marginLeft: 'auto', marginRight: 'auto', marginTop: '20px'}}
                >
                    <Typography gutterBottom>Tile Zoom Level</Typography>
                    <Slider
                        aria-label="slider"
                        defaultValue={8}
                        valueLabelDisplay="on"
                        min={1}
                        max={17}
                        step={1}
                        style={{marginTop: '45px'}}
                        onChange={handleSelectZoom}
                        onClick={handleClickZoom}
                        disabled={isLoading}
                    />
                </Box>

            </Box>
            <Button
                variant="contained"
                color="primary"
                startIcon={<CloudDownloadIcon/>}
                onClick={onSubmit}
                style={{marginTop: '45px', marginBottom: '100px', marginRight: "90px"}}
                disabled={
                    isLoading ||
                    !validatePixels(pixels) ||
                    !parseCoordinatesToObject(localStateUpperLeft) ||
                    !parseCoordinatesToObject(localStateLowerRight)
                }
            >
                Download Tiles
            </Button>
        </React.Fragment>
    );
}