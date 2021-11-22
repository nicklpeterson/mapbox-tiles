import {createAsyncThunk, createSelector, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {GpsCoordinate, SlippyMapCoordinate} from "../utils/Coordinates";
import {SlippyMapBox, StyleId, ZoomLevel} from "../utils/SlippyMapBox";
import axios from "axios";
import {nanoid} from "nanoid";

export type TileSize = 256 | 512 | 1024

export interface FormState {
    upperLeftCoordinate: GpsCoordinate,
    lowerRightCoordinate: GpsCoordinate,
    zoomLevel: ZoomLevel,
    loading: boolean,
    mapStyle: StyleId,
    pixels: TileSize,
    error: string
}

const initialState: FormState = {
    upperLeftCoordinate: {
        lat: null,
        lon: null
    },
    lowerRightCoordinate: {
        lat: null,
        lon: null
    },
    zoomLevel: 8,
    loading: false,
    mapStyle: 'satellite-streets-v11',
    pixels: 512,
    error: null
}
const BASE_MAPBOX_URL = process.env.REACT_APP_BASE_MAPBOX_URL
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_API_ACCESS_TOKEN
const FETCH_TILES_ACTION = 'form/fetchTiles'

const getUrl = (style: StyleId, pixels: number, zoom: ZoomLevel, tile: SlippyMapCoordinate) =>
    `${BASE_MAPBOX_URL}/${style}/tiles/${pixels}/${zoom}/${tile.x}/${tile.y}?access_token=${MAPBOX_ACCESS_TOKEN}`

export const fetchTiles = createAsyncThunk(
    FETCH_TILES_ACTION,
    async (tileBox: SlippyMapBox, thunkAPI: any) => {
        const formState: FormState = thunkAPI.getState().form

        console.info(`Downloading ${tileBox.tiles.length} tiles`)

        const results = await Promise.allSettled(
            tileBox.tiles.map((tile) => {
                return axios({
                    url: getUrl(tileBox.style, formState.pixels, tileBox.zoom, tile),
                    method: 'GET',
                    responseType: 'blob'
                }).then((response) => {
                    return new Promise((rej, res) => {
                        const filename = `mapbox-tile-${nanoid(10)}.jpg`
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', filename);
                        document.body.appendChild(link);
                        link.click();
                        res()
                    })
                })
            }))
        results.forEach((result) => console.log(result) )
        thunkAPI.dispatch(setLoadingToFalse())
        return results
    }
)

export const formSlice = createSlice({
    name: 'form',
    initialState,
    reducers: {
        setLoadingToTrue: state => { state.loading = true },
        setLoadingToFalse: state => { state.loading = false },
        setUpperLeftCoordinate: (state, action: PayloadAction<GpsCoordinate>) => {
            state.upperLeftCoordinate = action.payload
        },
        setLowerRightCoordinate: (state, action: PayloadAction<GpsCoordinate>) => {
            state.lowerRightCoordinate = action.payload
        },
        setZoomLevel: (state, action: PayloadAction<ZoomLevel>) => {
            state.zoomLevel = action.payload
        },
        setMapStyle: (state, action: PayloadAction<StyleId>) => {
            state.mapStyle = action.payload
        },
        setPixels: (state, action: PayloadAction<TileSize>) => {
            state.pixels = action.payload
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload
        },
        clearError: (state) => { state.error = null }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTiles.fulfilled, (state, action) => {
            console.log("SUCCESS")
        })
    }
});

export const {
    setLoadingToTrue,
    setLoadingToFalse,
    setUpperLeftCoordinate,
    setLowerRightCoordinate,
    setZoomLevel,
    setMapStyle,
    setPixels
} = formSlice.actions
const selectForm = state => state.form
export const mapStyleSelector = createSelector(selectForm, state => state.mapStyle)
export const upperLeftCoordinateSelector = createSelector(selectForm, state => state.upperLeftCoordinate)
export const lowerRightCoordinateSelector = createSelector(selectForm, state => state.lowerRightCoordinate)
export const zoomSelector = createSelector(selectForm, state => state.zoomLevel)
export const pixelSelector = createSelector(selectForm, state => state.pixels)
export const loadingSelector = createSelector(selectForm, state => state.loading)


export default formSlice.reducer
