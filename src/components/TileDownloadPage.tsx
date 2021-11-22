import { MapContainer } from './MapContainer'
import RequestForm from "./RequestForm";
import {useDispatch, useSelector} from "react-redux";
import {
    fetchTiles,
    loadingSelector, lowerRightCoordinateSelector,
    mapStyleSelector,
    setLoadingToFalse,
    setLoadingToTrue,
    upperLeftCoordinateSelector, zoomSelector
} from "../store/formSlice";
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {useEffect, useState} from "react";
import Modal from "./Modal";
import {getTileBox} from "../utils/slippy";

const DEFAULT_MODAL_TEXT = 'Are you sure you want to continue with download?'

export const TileDownloadPage = () => {
    const dispatch = useDispatch()
    const isLoading = useSelector(loadingSelector)
    const mapStyle = useSelector(mapStyleSelector)
    const upperLeftCoordinate = useSelector(upperLeftCoordinateSelector)
    const lowerRightCoordinate = useSelector(lowerRightCoordinateSelector)
    const zoomLevel = useSelector(zoomSelector)
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [modalText, setModalText] = useState<string>(DEFAULT_MODAL_TEXT)
    const [slippyTileBox, setTileBox] = useState<any>(null)

    const handleRequestTiles = (event) => {
        const tileBox = getTileBox(
            upperLeftCoordinate,
            lowerRightCoordinate,
            zoomLevel,
            mapStyle
        )

        if (tileBox) {
            setTileBox(tileBox)
            setModalText(`Are you sure you want to download ${tileBox.tiles.length} map tile files?`)
            setModalOpen(true)
        }
    }

    const onContinueDownload = () => {
        setModalOpen(false)
        setModalText(DEFAULT_MODAL_TEXT)
        dispatch(setLoadingToTrue())
        dispatch(fetchTiles(slippyTileBox))
    }

    const onCancelDownload = () => {
        setModalOpen(false)
        setModalText(DEFAULT_MODAL_TEXT)
        dispatch(setLoadingToFalse())
    }

    useEffect(() => {
        if (isLoading) {
            toast.info('Fetching Tiles!', {
                position: "top-right",
                hideProgressBar: true,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                autoClose: false,
                progress: undefined,
            });
        } else {
            toast.dismiss()
        }
    }, [isLoading])

    return (
        <>
            <MapContainer/>
            <RequestForm
                onSubmit={handleRequestTiles}
            />
            <ToastContainer/>
            <Modal
                onContinue={onContinueDownload}
                onDecline={onCancelDownload}
                open={modalOpen}
                text={modalText}
            />
        </>
    )
}