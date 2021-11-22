import {SlippyMapBox, StyleId, ZoomLevel} from "./SlippyMapBox";
import {GpsCoordinate, SlippyMapCoordinate} from "./Coordinates";

const RADIANS_PER_DEGREE = Math.PI / 180

/**
 * See https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Mathematics
 * for an explanation of this formula
*/
function getSlippyMapCoordinate(gpsCoordinate: GpsCoordinate, zoom: number): SlippyMapCoordinate {
    const latRadians = RADIANS_PER_DEGREE * gpsCoordinate.lat
    console.log(gpsCoordinate)
    const n = Math.pow(2, zoom)
    return {
        x: Math.floor((gpsCoordinate.lon + 180) / 360 * n),
        y: Math.floor((1 - Math.log(Math.tan(latRadians) + (1 / Math.cos(latRadians))) / Math.PI) / 2 * n)
    }
}

function getTiles(slippyUpperLeft: SlippyMapCoordinate, slippyLowerRight: SlippyMapCoordinate): Array<SlippyMapCoordinate> {
    const tiles = []

    for (let x = slippyUpperLeft.x; x <= slippyLowerRight.x; x++) {
        for(let y = slippyUpperLeft.y; y <= slippyLowerRight.y; y++) {
            tiles.push({x: x, y: y})
        }
    }

    return tiles
}

export function getTileBox(
    upperLeftCoordinate: GpsCoordinate,
    lowerRightCoordinate: GpsCoordinate,
    zoomLevel: ZoomLevel,
    styleId: StyleId):
    SlippyMapBox {
    const slippyUpperLeft = getSlippyMapCoordinate(upperLeftCoordinate, zoomLevel)
    const slippyLowerRight = getSlippyMapCoordinate(lowerRightCoordinate, zoomLevel)

    const xCount = Math.abs(slippyUpperLeft.x - slippyLowerRight.x) + 1
    const yCount = Math.abs(slippyUpperLeft.y - slippyLowerRight.y) + 1

    return {
        upperLeftCoordinate: slippyUpperLeft,
        lowerRightCoordinate: slippyLowerRight,
        zoom: zoomLevel,
        xCount: xCount,
        yCount: yCount,
        style: styleId,
        numTiles: xCount * yCount,
        tiles: getTiles(slippyUpperLeft, slippyLowerRight)
    }
}

