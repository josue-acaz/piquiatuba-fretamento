import React, {useState, useEffect} from 'react';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import DeleteIcon from '@material-ui/icons/Delete';
import {useLocation, useParams} from 'react-router-dom';
import {WrapperContent, FlexSpaceBetween} from '../../../core/design';
import {GoBack, PageTitle, Dropdown} from '../../../components';
import UploadDialog from '../../../components/UploadDialog';
import Switch from '@material-ui/core/Switch';
import UpdateIcon from '@material-ui/icons/Update';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Skeleton from '@material-ui/lab/Skeleton';
import Select from '@material-ui/core/Select';
import SingleUploadDialog from '../../../components/UploadDialog/Single';
import MenuItem from '@material-ui/core/MenuItem';
import {baseURL, EnumAircraftImageView} from '../../../global';
import api from '../../../api';
import no_image from '../../../assets/img/no-image.png';

import './styles.css';

const SkeletonImage = () => (<Skeleton style={{borderRadius: '.5rem'}} variant="rect" animation="wave" width={500} height={220} />);

function SingleThumb({ 
    image,
    className, 
    aircraft_id, 
    thumb_type, 
    title, 
    handleRefresh,
    loading=true}) {
    const [open, setOpen] = useState(false);
    function toggleOpen() {
        setOpen(!open);
    }

    return(
        <div className="single-thumb">
            <SingleUploadDialog 
                open={open} 
                params={{thumb_type}} 
                fileName="thumbimage" 
                handleClose={toggleOpen}
                handleRefresh={() => handleRefresh()}
                endpoint={`${baseURL}/aircrafts/${aircraft_id}/thumbimages`} 
            />
            <div className={`single-thumb-container ${className}`}>
                <h3>{title}</h3>
                <div className="single-thumb-image">
                    <div className="action">
                        <Tooltip title="Atualizar" onClick={toggleOpen}>
                            <button className="change-thumb-bnt">
                                <UpdateIcon className="icon" />
                            </button>
                        </Tooltip>
                    </div>
                    {loading ? <SkeletonImage /> : (
                        <img src={image ? image : no_image} alt="" />
                    )}
                </div>
            </div>
        </div>
    );
}

/**Esses componentes são da galeria principal (INÍCIO) */
function SlickImage({image, index, array_length, exclude, loading=true}) {
    const [doc, setDoc] = useState(image.doc);

    async function handleCheckDoc(e) {
        const {checked} = e.target;
        setDoc(checked);

        try {
            const response = await api.put(`/aircrafts/${image.aircraft_id}/images/${image.id}/update`, {
                doc: checked,
            });
            const [updated] = response.data;

            if(updated === 1) {
                console.log('Imagem atualizada...');
            }
        } catch (error) {
            console.error(error);
        }
    }

    const [checked, setChecked] = useState(false);
    function handleChecked(e) {
        setChecked(e.target.checked);
    }

    return(
        <div className={`slick-image ${index === 0 ? 'rm-margin-left' : ''} ${index === array_length-1 ? 'rm-margin-right' : ''}`}>
            {exclude ? (
                <div className="check-remove">
                    <Checkbox checked={checked} onChange={handleChecked} color="secondary" />
                </div>
            ) : (
                <Tooltip title={doc ? 'Remover da geração de cotação' : 'Incluir na geração da cotação'}>
                    <div className="checkDoc">
                        <p>DOC</p>
                        <Switch
                            checked={doc}
                            onChange={handleCheckDoc}
                            color="primary"
                            name="doc"
                            inputProps={{ 'aria-label': 'primary checkbox' }}
                        />
                    </div>
                </Tooltip>
            )}
            {loading ? <SkeletonImage /> : (
                <img src={image.file.url} alt="" />
            )}
        </div>
    )
}

function SlickCarousel({exclude, images, loading}) {
    return(
        <div className="slick-carousel">
            <div className="slick-container">
                {images.map((image, index) => (
                    <SlickImage 
                        key={index}
                        image={image} 
                        index={index} 
                        array_length={images.length} 
                        exclude={exclude}
                        loading={loading}
                    />
                ))}
            </div>
        </div>
    );
}

function GalleryTransportType({
    type_of_transport, 
    title, 
    aircraft_id, 
    handleRefresh, 
    gallery,
    loading}) {
    const [open, setOpen] = useState(false);
    const [exclude, setExclude] = useState(false);
    const [view, setView] = useState(''); // Tipo de imagem da aeoronave

    function handleOpen() {
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
    }

    function handleChangeView(e) {
        setView(e.target.value);
    }

    const action_options = [
        {
            label: 'Adicionar',
            icon: AddIcon,
            onClick: () => handleOpen(),
        },
        {
            label: 'Remover',
            icon: DeleteOutlineIcon,
            onClick: () => setExclude(true),
        },
    ];

    return(
        <div className={`gallery-transport gallery-${type_of_transport}`}>
            <h3 className="title">{title}</h3>
            {gallery.length > 0 ? (
                <>
                    <UploadDialog 
                        open={open} 
                        fileName="image"
                        handleClose={handleClose} 
                        onCloseAndUploadedFiles={() => {
                            handleClose();
                            handleRefresh();
                            console.log('Refresh firing...');
                        }}
                        params={{
                            view,
                            type: type_of_transport,
                        }}
                        endpoint={`${baseURL}/aircrafts/${aircraft_id}/images`}
                        enableUpload={!!view}
                    >
                        <Select 
                            id="view" 
                            name="view" 
                            className="select" 
                            displayEmpty
                            value={view}
                            disableUnderline={true}
                            onChange={handleChangeView}
                        >
                            <MenuItem disabled value="">
                                <em>Selecione o tipo de imagem...</em>
                            </MenuItem>
                            {EnumAircraftImageView.map((aircraft_image_view, index) => (
                                <MenuItem 
                                    key={index} 
                                    value={aircraft_image_view.key}
                                >
                                    {aircraft_image_view.value}
                                </MenuItem>
                            ))}
                        </Select>
                    </UploadDialog>
                    <div className="header">
                        {exclude ? (
                            <FlexSpaceBetween className="delete-gallery-image">
                                <div className="cancel">
                                    <Button onClick={() => setExclude(false)} variant="outlined">Cancelar</Button>
                                </div>
                                <div className="action-delete">
                                    <Tooltip title="Excluir selecionados">
                                        <IconButton size="medium">
                                            <DeleteIcon className="icon" />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            </FlexSpaceBetween>
                        ) : (
                            <Dropdown 
                                Icon={EditOutlinedIcon} 
                                options={action_options} 
                                dropPosition="right" 
                                decoration="square"
                                text="Editar"
                                iconSize="small"
                            />
                        )}
                    </div>
                    <SlickCarousel 
                        images={gallery} 
                        exclude={exclude} 
                        loading={loading} 
                    />
                </>
            ) : (<p className="no-images">Nenhuma imagem</p>)}
        </div>
    );
}
/**Esses componentes são da galeria principal (FIM) */

function ThumbImages({aircraft_id}) {
    const [loading, setLoading] = useState(true);
    const [thumbs, setThumbs] = useState({
        thumbnail: null,
        seating_map: null,
    });

    const singleThumbs = [
        {
            title: 'Foto de exibição da aeronave',
            thumb_type: 'thumbnail',
            class_name: 'rm-margin-left',
        },
        {
            title: 'Foto do mapa de assentos',
            thumb_type: 'seating_map',
            class_name: 'rm-margin-right',
        },
    ];

    async function index() {
        try {
            const response = await api.get(`/aircrafts/${aircraft_id}/thumbimages`);
            console.log(response.data);
            setThumbs(response.data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error(error);
        }
    }

    useEffect(() => {index()}, []);

    function handleRefresh() {
        index();
    }

    return(
        <div className="thumb-gallery">
            {singleThumbs.map((single_thumb, index) => (
                <SingleThumb 
                    key={index}
                    loading={loading}
                    aircraft_id={aircraft_id}
                    title={single_thumb.title} 
                    className={single_thumb.class_name}
                    thumb_type={single_thumb.thumb_type} 
                    image={thumbs[single_thumb.thumb_type]?.url}
                    handleRefresh={handleRefresh}
                />
            ))}
        </div>
    );
}

export default function AircraftGallery({history}) {
    const {aircraft_id} = useParams();
    const {
        aircraft_name, 
        operates_aeromedical_transport,
    } = useLocation().state;
    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState([]);

    async function index() {
        setLoading(true);

        try {
            const response = await api.get(`/aircrafts/${aircraft_id}/images`);
            setImages(response.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    }

    useEffect(() => {index()}, []);

    function handleGoBack() {
        history.goBack();
    }

    function getGalleryType(aircraft_images, type) {
        return aircraft_images.filter(aircraft_image => type === aircraft_image.type);
    }

    let transportTypeImages = [
        {
            title: 'Transporte de passageiros',
            type_of_transport: 'passengers', 
        },
    ];

    // Se opera transporte aeromédico
    if(operates_aeromedical_transport) {
        transportTypeImages.push({
            title: 'Transporte aeromédico',
            type_of_transport: 'aeromedical',
        });
    }

    return(
        <WrapperContent>
            <GoBack onClick={handleGoBack} />
            <PageTitle title={aircraft_name} subtitle="Piquiatuba Táxi Aéreo" />

            <section className="gallery">
                <ThumbImages aircraft_id={aircraft_id} />
                <div className="divider-gallery">
                    <Divider />
                </div>
                <div className="main-gallery">
                    {transportTypeImages.map((transport_type_image, index) => (
                        <GalleryTransportType 
                            key={index}
                            loading={loading}
                            aircraft_id={aircraft_id} 
                            handleRefresh={() => index()} 
                            title={transport_type_image.title}
                            type_of_transport={transport_type_image.type_of_transport} 
                            gallery={getGalleryType(images, transport_type_image.type_of_transport)}
                        />
                    ))}
                </div>

            </section>
        </WrapperContent>
    );
}
