import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import SingleUpload from '../../Upload/Single';
import Transition from '../../Transition';
import {useFeedback} from '../../../core/feedback/feedback.context';
import api from '../../../api';

export default function SingleUploadDialog({
    open,
    handleClose,
    fileName,
    endpoint,
    params,
    handleRefresh,
}) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const feedback = useFeedback();

    const processUpload = file => {
        setUploading(true);
        const data = new FormData();
    
        data.append(fileName, file, file.name);
        api.put(endpoint, data, {
            params,
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: e => {
                const progress = parseInt(Math.round((e.loaded * 100) / e.total));
                setProgress(progress);
            }
        })
        .then(response => {
            setUploading(false);
            feedback.open({
                severity: 'success',
                msg: 'Upload feito com sucesso!',
            });
            handleClose();
            handleRefresh();
        })
        .catch(() => {
            setUploading(false);
            feedback.open({
                severity: 'error',
                msg: 'Ocorreu um erro!',
            });
        });
    };

    return(
        <Dialog
            open={open}
            className="upload-dialog"
            TransitionComponent={Transition}
            keepMounted
            fullWidth
            disableBackdropClick={uploading}
            onClose={handleClose}
            aria-labelledby="alert-dialog-slide-title"
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogContent style={{padding: '1rem'}} className="upload-dialog-content">
                <SingleUpload 
                    progress={progress}
                    uploading={uploading}
                    onClose={handleClose}
                    onUpload={processUpload}  
                />
            </DialogContent>
        </Dialog>
    );
}