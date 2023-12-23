import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export type ModalProps = {
    open: boolean,
    onContinue: (event) => any,
    onDecline: (event) => any,
    text: string
}

export default function Modal({open, onContinue, onDecline, text}: ModalProps) {
    return (
        <div>
            <Dialog
                open={open}
                onClose={onDecline}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Use Google's location service?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {text}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onDecline}>Cancel</Button>
                    <Button onClick={onContinue} autoFocus>
                        Continue
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
