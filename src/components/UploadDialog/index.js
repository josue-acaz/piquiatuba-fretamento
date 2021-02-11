import React, {useState, useEffect} from 'react';
import Upload from '../Upload';
import Transition from '../Transition';
import FileList from '../Upload/FileList';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import { uniqueId } from "lodash";
import filesize from "filesize";
import axios from 'axios';

import './styles.css';

export default function UploadDialog({
    children, 
    open, 
    endpoint, 
    fileName, 
    params,
    handleClose, 
    onCloseAndUploadedFiles,
    enableUpload=true}) {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    async function handleUpload(files) {
        setUploading(true);
        const _uploadedFiles = files.map(file => ({
            file,
            id: uniqueId(),
            name: file.name,
            readableSize: filesize(file.size),
            preview: URL.createObjectURL(file),
            progress: 0,
            uploaded: false,
            error: false,
            url: '',
            key: '',
            size: '',
            type: '',
          }));
      
        setUploadedFiles(uploadedFiles => uploadedFiles.concat(_uploadedFiles));
        _uploadedFiles.forEach(processUpload);
    }

    const updateFile = (id, data) => {
        setUploadedFiles(uploadedFiles => uploadedFiles.map(uploadedFile => id === uploadedFile.id ? { ...uploadedFile, ...data } : uploadedFile));
    }

    const processUpload = uploadedFile => {
        const data = new FormData();
    
        data.append(fileName, uploadedFile.file, uploadedFile.name);
    
        axios.post(endpoint, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
            params, 
            onUploadProgress: e => {
              const progress = parseInt(Math.round((e.loaded * 100) / e.total));
    
              updateFile(uploadedFile.id, {
                progress
              });
            }
          })
          .then(response => {
            updateFile(uploadedFile.id, {
                url: response.data.url,
                key: response.data.key,
                size: response.data.size,
                type: response.data.mimetype,
                uploaded: true,
            });

            setUploading(false);
          })
          .catch(() => {
            updateFile(uploadedFile.id, {
              error: true
            });

            setUploading(false);
          });
    };

    async function handleDelete() {

    }

    useEffect(() => {
        return function cleanup() {
            uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return(
        <Dialog
            open={open}
            className="upload-dialog"
            TransitionComponent={Transition}
            keepMounted
            disableBackdropClick={uploading}
            onClose={handleClose}
            aria-labelledby="alert-dialog-slide-title"
            aria-describedby="alert-dialog-slide-description"
        >
            <DialogContent style={{padding: '1rem'}} className="upload-dialog-content">
                {enableUpload && (
                    <>
                        <Upload onUpload={handleUpload} />
                        {!!uploadedFiles.length && (
                            <FileList files={uploadedFiles} onDelete={handleDelete} />
                        )}
                    </>
                )}
                {children}
                <Button 
                    style={{marginTop: 10}} 
                    className="btn-dialog" 
                    variant="contained" 
                    onClick={uploadedFiles.length > 0 ? onCloseAndUploadedFiles : handleClose} 
                    disabled={uploading}
                >Fechar</Button>
            </DialogContent>
        </Dialog>
    );
}