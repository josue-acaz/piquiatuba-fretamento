import React, {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {GoBack, UTILoader} from '../../components';
import { useParams } from 'react-router-dom';
import PT from "prop-types";
import {LightgalleryItem, LightgalleryProvider, useLightgallery} from 'react-lightgallery';
import { WrapperContent } from '../../core/design';
import {Row, Col} from 'react-bootstrap';
import api from '../../api';

import "lightgallery.js/dist/css/lightgallery.css";
import './styles.css';

const PhotoItem = ({ image, thumb, group }) => (
    <div className="photo-item">
      <LightgalleryItem group={group} src={image} thumb={thumb}>
        <img src={image} alt="" />
      </LightgalleryItem>
    </div>
);

PhotoItem.propTypes = {
    image: PT.string.isRequired,
    thumb: PT.string,
    group: PT.string.isRequired
};
  
const OpenButtonWithHook = props => {
    const { openGallery } = useLightgallery();
    return (
      <button
        {...props}
        onClick={() => openGallery("group2")}
        className={["button is-primary", props.className || ""].join(" ")}
      >
        Open second photos group (using hook)
      </button>
    );
};

OpenButtonWithHook.propTypes = {
    className: PT.string
};  

const allowedMimesPhotos = [
    "image/jpg",
    "image/jpeg",
    "image/pjpeg",
    "image/png",
    "image/gif",
];

const allowedMimesDocuments = ["application/pdf"];

export default function Documents({history}) {
    const {state} = useLocation();
    const {patient_information_id} = useParams();
    const [documents, setDocuments] = useState(state ? state.documents : null);
    const [loading, setLoading] = useState(true);
    const [patientInformationFullName, setPatientInformationFullName] = useState(state ? state.patient_information_full_name : '');
    const [images, setImages] = useState([]);
    const [files, setFiles] = useState([]);

    function goBack() {
        history.goBack();
    }

    function getPhotos(documents=[]) {
        return documents
        .filter(document => allowedMimesPhotos.includes(document.type))
        .map(document => document.url);
    }

    function getDocuments(documents=[]) {
        return documents
        .filter(document => allowedMimesDocuments.includes(document.type))
        .map(document => document.url);
    }

    useEffect(() => {
        async function show() {
            try {
                const response = await api.get(`/quotations/patient_informations/${patient_information_id}/show`);
                const patient_information = response.data;
                setPatientInformationFullName(patient_information.full_name);
                setImages(getPhotos(patient_information.documents));
                setFiles(getDocuments(patient_information.documents));
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.error(error);
            }
        }

        // Se for fornecido, buscar do banco de dados
        if(patient_information_id !== 'state') {
            show();
        } else { // Se o id não for fornecido, os documentos vem pelo state
            setImages(getPhotos(documents));
            setFiles(getDocuments(documents));
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return(
        <WrapperContent id="show-documents" className="show-documents">
                <div className="header">
                    {patient_information_id === 'state' && <GoBack onClick={goBack} />}
                    <p><strong>{patientInformationFullName}</strong></p>
                </div>

                {loading ? <UTILoader /> : (
                    <div className="content">
                        <div className="_photos">
                            <h3>Imagens</h3>
                            <LightgalleryProvider>
                                <Row className="center-padding">
                                    {images.map((p, idx) => (
                                        <Col key={idx} sm="4">
                                            <PhotoItem key={idx} image={p} group="group2" />
                                        </Col>
                                    ))}
                                </Row>
                            </LightgalleryProvider>
                        </div>
                        <div className="_documents">
                            <h3>Documentos</h3>
                            {files.length > 0 ? (
                                files.map((file, index) => (
                                    <a href={file}>Documento Nº{index}</a>
                                ))
                            ) : <p>Nenhum documento disponível</p>}
                        </div>
                    </div>
                )}
        </WrapperContent>
    );
}