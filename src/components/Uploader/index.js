import React, {useState, useEffect} from 'react';
import Upload from '../Upload';
import { uniqueId } from 'lodash';
import filesize from 'filesize';
import { baseURL } from '../../global';
import axios from 'axios';

import './styles.css';

export default function Uploader(props) {
    const {
        fileName,
        params,
        initialFiles=[],
        uploading, 
        getUploadedFiles,
    } = props;

    const [uploadedFiles, setUploadedFiles] = useState(initialFiles);

    async function handleUpload(files) {
        const _uploadedFiles = files.map(file => ({
            id: uniqueId(),
            file,
            name: file.name,
            readableSize: filesize(file.size),
            preview: URL.createObjectURL(file),
            progress: 0,
            uploaded: false,
            error: false,
          }));
      
        setUploadedFiles(uploadedFiles => uploadedFiles.concat(_uploadedFiles));
        _uploadedFiles.forEach(processUpload);
    }

    const updateFile = (id, data) => {
        setUploadedFiles(uploadedFiles => uploadedFiles.map(uploadedFile => id === uploadedFile.id ? { ...uploadedFile, ...data } : uploadedFile));
    }

    const processUpload = (uploadedFile) => {
        uploading(true);
        const data = new FormData();
    
        if(!uploadedFile.file) return;
        data.append(fileName, uploadedFile.file, uploadedFile.name);
    
        axios.post(baseURL+'/uploads', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
            params, 
            onUploadProgress: e => {
              const progress = Number(Math.round((e.loaded * 100) / e.total)).toFixed(0);
    
              updateFile(uploadedFile.id, {
                progress
              });
            }
          })
          .then(response => {
            const uploaded_file_id = uploadedFile.id;
            let data = {
                url: response.data.url,
                key: response.data.key,
                size: response.data.size,
                type: response.data.mimetype,
                uploaded: true,
            };

            let arr = uploadedFiles;
            arr.push({ ...uploadedFile, ...data });

            getUploadedFiles(arr);
            updateFile(uploaded_file_id, data);
            uploading(false);
          })
          .catch(() => {
            updateFile(uploadedFile.id, {
              error: true
            });
            uploading(false);
          });
    };

    async function handleDelete(uploadedFile) {
        const {id, key, file_id} = uploadedFile;
        
        try {
            if(file_id) {
                await axios.delete(`${baseURL}/files/${file_id}/delete`);
            } else {
                await axios.delete(`${baseURL}/uploads/delete`, {
                    headers: {key}
                });
            }

            const arr = uploadedFiles.filter(file => file.id !== id);
            getUploadedFiles(arr);
            setUploadedFiles(arr);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        return function cleanup() {
            uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return(
        <div className="uploader">
            <Upload uploadedFiles={uploadedFiles} onUpload={handleUpload} handleDelete={handleDelete} />
        </div>
    );
}