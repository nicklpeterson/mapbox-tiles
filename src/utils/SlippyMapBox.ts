import { SlippyMapCoordinate } from "./Coordinates";

/**
 * Represents a set of slippy map coordinates contained by a bounding box
 */
export type SlippyMapBox = {
    upperLeftCoordinate: SlippyMapCoordinate,
    lowerRightCoordinate: SlippyMapCoordinate,
    zoom: ZoomLevel,
    xCount: number,
    yCount: number,
    numTiles: number,
    style: StyleId,
    tiles: Array<SlippyMapCoordinate>
}

export type ZoomLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17

export type StyleId = 'streets-v11' |
    'outdoors-v11' |
    'light-v10' |
    'dark-v10' |
    'satellite-v9' |
    'satellite-streets-v11' |
    'navigation-day-v1' |
    'navigation-night-v1'