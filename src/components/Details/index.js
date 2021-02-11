import React, {useEffect, useState} from "react";
import { getAerodrome, getAircraft, currency, getAdmin } from "../../utils";
import VerticalTable from '../VerticalTable';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';

import './styles.css';

export default function Details({ quotation, history }) {
    const { patient_informations } = quotation;
    const current_information = patient_informations[patient_informations.length - 1];
    const [patientInformation, setPatientInformation] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [processing, setProcessing] = useState(true);

    const labels = [
        {
            id: 1,
            text: "Administrador",
            align: "left",
        },
        {
            id: 2,
            text: "Origem",
            align: "right",
        },
        {
            id: 3,
            text: "Destino",
            align: "right",
        },
        {
            id: 4,
            text: "Aeronave",
            align: "right",
        },
        {
            id: 5,
            text: "Preço cotado",
            align: "right",
        },
    ];

    const rows = [
        {
            id: 1,
            cells: [
                {
                    id: 1,
                    align: 'left',
                    text: getAdmin(quotation),
                },
                {
                    id: 2,
                    align: 'right',
                    text: getAerodrome(quotation, "origin_aerodrome"),
                },
                {
                    id: 3,
                    align: 'right',
                    text: getAerodrome(quotation, "destination_aerodrome"),
                },
                {
                    id: 4,
                    align: 'right',
                    text: getAircraft(quotation),
                },
                {
                    id: 5,
                    align: 'right',
                    text: quotation.price ? currency(quotation.price) : "Indisponível",
                },
            ],
        }
    ];

    function showDocuments(patient_information_id, documents, patient_information_full_name) {
        history.push('/documents/state/show', {
            documents,
            patient_information_full_name,
        });
    }

    useEffect(() => {
        if(patient_informations.length > 0) {
            const patient_information = [
                {
                    id: 20,
                    label: 'Cidade de Origem',
                    text: current_information.origin_city ? `${current_information.origin_city} - ${current_information.origin_uf}` : 'Indisponível',
                },
                {
                    id: 21,
                    label: 'Cidade de Destino',
                    text: current_information.destination_city ? `${current_information.destination_city} - ${current_information.destination_uf}` : 'Indisponível',
                },
                {
                    id: 1,
                    label: 'Nome do paciente',
                    text: current_information.name,
                },
                {
                    id: 2,
                    label: 'Número do leito',
                    text: current_information.bed_number,
                },
                {
                    id: 3,
                    label: 'Idade do paciente',
                    text: current_information.patient_age,
                },
                {
                    id: 4,
                    label: 'Peso do paciente',
                    text: current_information.patient_weight,
                },
                {
                    id: 5,
                    label: 'Suspeita de covid?',
                    text: current_information.covid ? 'SIM' : 'NÃO',
                },
                {
                    id: 6,
                    label: 'Plano',
                    text: current_information.plan === 'plan' ? 'Plano' : 'Particular',
                },
                {
                    id: 7,
                    label: 'Nome do acompanhante',
                    text: current_information.companion,
                },
                {
                    id: 8,
                    label: 'Contato do acompanhante',
                    text: current_information.companion_contact,
                },
                {
                    id: 9,
                    label: 'Contato de emergência',
                    text: current_information.emergency_contact,
                },
                {
                    id: 10,
                    label: 'Hospital de Origem',
                    text: current_information.origin_hospital,
                },
                {
                    id: 11,
                    label: 'Médico do hospital de origem',
                    text: current_information.origin_doctor,
                },
                {
                    id: 12,
                    label: 'Contato do médico do hospital de origem',
                    text: current_information.contact_doctor_origin,
                },
                {
                    id: 13,
                    label: 'Hospital de Destino',
                    text: current_information.destination_hospital,
                },
                {
                    id: 14,
                    label: 'Médico do hospital de destino',
                    text: current_information.destination_doctor,
                },
                {
                    id: 15,
                    label: 'Contato do médico do hospital de destino',
                    text: current_information.contact_doctor_destination,
                },
            ];

            setPatientInformation(patient_information);
            if(current_information.documents.length > 0) {
                setDocuments(current_information.documents);
            }
        }

        setProcessing(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return(
        !processing && (
            <>
                <Table style={{padding: 0}} size="small" aria-label="purchases">
                    <TableHead>
                    <TableRow>
                        {labels.map(label => (
                        <TableCell 
                            key={label.id}
                            style={{border: 'none'}} 
                            align={label.align}
                        >{label.text}</TableCell>
                        ))}
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {rows.map(row => (
                        <TableRow key={row.id}>
                        {row.cells.map(cell => (
                            <TableCell style={{border: 'none'}} key={cell.id} align={cell.align}>
                                {cell.text}
                            </TableCell>
                        ))}
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>

                {quotation.type_of_transport === 'aeromedical' && (
                    <div className="patient_informations">
                        {patientInformation.length > 0 ? (
                                patient_informations[0].fill_date ? (
                                    <>
                                        <div className="patient_informations_head">
                                            <h2 className="title">Informações do paciente</h2>
                                            {documents.length > 0 ? (
                                                <div className="with-documents">
                                                    <button onClick={() => {
                                                        showDocuments(current_information.id, current_information.documents, current_information.full_name);
                                                    }}>Arquivos</button>
                                                </div>
                                            ) : (
                                                <div className="no-documents">
                                                    <p className="title">A informação não contém arquivos.</p>
                                                </div>
                                            )}
                                        </div>
                                        <VerticalTable rows={patientInformation} />
                                    </>
                                ) : (<p className="form-awaiting-fit"><strong>{patient_informations[0].code}</strong> Formulário aguardando preenchimento.</p>)
                            ) : (
                                <div className="no-informations">
                                    <p>Nenhum informação disponível para o paciente desta cotação.</p>
                                </div>
                            )}
                    </div>
                )}
            </>
        )
    );
}