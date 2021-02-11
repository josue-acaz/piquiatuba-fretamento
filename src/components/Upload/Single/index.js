import React, { useState, useMemo } from 'react';
import Dropzone from "react-dropzone";
import Button from '@material-ui/core/Button';
import camera from '../../../assets/img/camera.svg';
import CircularProgressUpload from '../../CircularProgressUpload';

import './styles.css';

export default function SingleUpload({ 
    onUpload, 
    onClose, 
    progress, 
    uploading=false, 
}) {
  const[file, setFile] = useState(null);

  const preview = useMemo(() => {
    return file ? URL.createObjectURL(file) : null;
  }, [file]);

  const renderDragMessage = (isDragActive, isDragReject) => {
    if (!isDragActive) {
      return <p>Arraste aqui o arquivo!</p>;
    }

    if (isDragReject) {
      return <p type="error">Arquivo não suportado</p>;
    }

    return <p type="success">Solte aqui...</p>;
  };

  return (
    <div className="dropzone-single">
      {uploading ? (
        <CircularProgressUpload value={progress} />
      ) : (
        <>
            <Dropzone accept="image/*" onDropAccepted={acceptedFiles => {
                acceptedFiles.forEach((file) => {
                    setFile(file);
                });
            }}>
                {({getRootProps, getInputProps, isDragActive, isDragReject}) => (
                <div 
                    {...getRootProps()} 
                    isDragActive={isDragActive}
                    isDragReject={isDragReject}
                    className={isDragReject ? "dropzone-container-not-accept" : "dropzone-container"}
                >
                    <label id="file" style={{ backgroundImage: `url(${preview})` }}>
                    <input {...getInputProps()} />
                    <img src={camera} alt="selectimage" />
                        {renderDragMessage(isDragActive, isDragReject)}
                    </label>
                </div>
                )}
            </Dropzone>
            <div className="group-btn">
                <Button color="default" variant="contained" onClick={onClose}>Fechar</Button>
                <Button color="primary" disabled={!file} variant="contained" onClick={() => onUpload(file)}>Fazer Upload</Button>
            </div>
        </>
      )}
    </div>
  )
}