import React from "react";
import {CircularProgressbar} from 'react-circular-progressbar';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import LinkIcon from '@material-ui/icons/Link';

import { Container, FileInfo, Preview } from "./styles";

function File({uploadedFile, onDelete}) {
  return(
    <li key={uploadedFile.id}>
        <FileInfo>
          <Preview src={uploadedFile.preview} />
          <div>
            <strong>{uploadedFile.name}</strong>
            <span>
              {uploadedFile.readableSize}{" "}
              {!!uploadedFile.url && (
                <button type="button" onClick={() => onDelete(uploadedFile)}>
                  Excluir
                </button>
              )}
            </span>
          </div>
        </FileInfo>

        <div>
          {!uploadedFile.uploaded &&
            !uploadedFile.error && (
              <CircularProgressbar
                styles={{
                  root: { width: 24 },
                  path: { stroke: "#7159c1" }
                }}
                strokeWidth={10}
                percentage={uploadedFile.progress}
              />
            )}

          {uploadedFile.url && (
            <a
              href={uploadedFile.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkIcon style={{ marginRight: 8, color: '#222', fontSize: 24 }} />
            </a>
          )}

          {uploadedFile.uploaded && <CheckCircleOutlineIcon style={{color: '#78e5d5', fontSize: 24}} />}
          {uploadedFile.error && <ErrorOutlineIcon style={{color: '#e57878', fontSize: 24}} />}
        </div>
      </li>
  );
}

const FileList = ({ files, onDelete }) => (
  <Container>
    {files.map(uploadedFile => <File key={uploadedFile.id} uploadedFile={uploadedFile} onDelete={onDelete} />)}
  </Container>
);

export default FileList;